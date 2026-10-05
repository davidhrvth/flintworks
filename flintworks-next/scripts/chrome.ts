/** Headless Chrome over CDP: renders the brand-kit builds' PNGs and print PDFs. Needs Google Chrome on this machine. */
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

type Cdp = {
  send: (method: string, params?: object) => Promise<{ result?: Record<string, unknown> }>
  close: () => void
}

export async function launchChrome(): Promise<Cdp> {
  const profile = mkdtempSync(join(tmpdir(), 'fw-brand-'))
  const port = 9400 + Math.floor(Math.random() * 400)
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--hide-scrollbars', '--no-first-run', 'about:blank'], {
    stdio: 'ignore',
  })
  let wsUrl = ''
  for (let i = 0; i < 60 && !wsUrl; i++) {
    try {
      const targets = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()) as { type: string; webSocketDebuggerUrl: string }[]
      wsUrl = targets.find((t) => t.type === 'page')?.webSocketDebuggerUrl ?? ''
    } catch {}
    if (!wsUrl) await new Promise((res) => setTimeout(res, 200))
  }
  if (!wsUrl) throw new Error('Chrome did not start')
  const ws = new WebSocket(wsUrl)
  await new Promise((res) => ws.addEventListener('open', res))
  let id = 0
  const pending = new Map<number, (m: { result?: Record<string, unknown> }) => void>()
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(String(e.data))
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)!(m)
      pending.delete(m.id)
    }
  })
  return {
    send: (method, params = {}) =>
      new Promise((res) => {
        const i = ++id
        pending.set(i, res)
        ws.send(JSON.stringify({ id: i, method, params }))
      }),
    close: () => {
      ws.close()
      // Chrome keeps writing to its profile until it has actually exited, and its helpers a moment longer.
      // A profile left behind in the temp folder is harmless; a throw here would fail a build that succeeded.
      proc.once('exit', () => {
        try {
          rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
        } catch {}
      })
      proc.kill()
    },
  }
}

export async function makeRenderer(cdp: Cdp) {
  await cdp.send('Page.enable')
  const tree = await cdp.send('Page.getFrameTree')
  const frameId = (tree.result as { frameTree: { frame: { id: string } } }).frameTree.frame.id
  const evaluate = async (expression: string) =>
    ((await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result as { result?: { value?: unknown } })?.result?.value

  async function load(html: string, width: number, height: number, transparent: boolean) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
    await cdp.send('Emulation.setDefaultBackgroundColorOverride', transparent ? { color: { r: 0, g: 0, b: 0, a: 0 } } : {})
    await cdp.send('Page.setDocumentContent', { frameId, html })
    // Wait for linked stylesheets, every declared font face (not just the ones already pending) and embedded images.
    await evaluate(`(async () => {
      await Promise.all([...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.sheet ? 0 : new Promise((r) => { l.onload = r; l.onerror = r })))
      await Promise.all([...document.fonts].map((f) => f.load().catch(() => 0)))
      await document.fonts.ready
      await Promise.all([...document.querySelectorAll('img, image')].map((i) => i.decode().catch(() => 0)))
      await new Promise((r) => setTimeout(r, 100))
    })()`)
  }

  async function capture(width: number, height: number) {
    const res = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width, height, scale: 1 } })
    return Buffer.from((res.result as { data: string }).data, 'base64')
  }

  /** Render standalone SVG markup scaled to exactly width × height, transparent unless `bg` is set. */
  async function png(svgMarkup: string, width: number, height: number, bg?: string) {
    const html = `<!doctype html><html><head><style>html,body{margin:0;background:${bg ?? 'transparent'}}svg{display:block;width:${width}px;height:${height}px}</style></head><body>${svgMarkup}</body></html>`
    await load(html, width, height, !bg)
    return capture(width, height)
  }

  async function page(html: string, width: number, height: number) {
    await load(html, width, height, false)
    return capture(width, height)
  }

  /** Print a page to a vector PDF. The page sets its own sheet size with CSS `@page`. */
  async function pdf(html: string) {
    await load(html, 1200, 800, false)
    const res = await cdp.send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 })
    return Buffer.from((res.result as { data: string }).data, 'base64')
  }

  return { png, page, pdf, load, capture, evaluate }
}
