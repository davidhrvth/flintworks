import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

/** Serialize CSV writes so concurrent signups don't interleave. */
let writeChain: Promise<unknown> = Promise.resolve()

function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn)
  writeChain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

async function ensureCsv(filePath: string, header: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true })
  try {
    await readFile(filePath, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    await writeFile(filePath, `${header}\n`, 'utf8')
  }
}

function emailFromRow(line: string): string {
  const comma = line.indexOf(',')
  if (comma < 0) return ''
  const raw = line.slice(comma + 1).trim()
  if (raw.startsWith('"') && raw.endsWith('"')) {
    return raw.slice(1, -1).replaceAll('""', '"').toLowerCase()
  }
  return raw.toLowerCase()
}

export async function csvHasEmail(filePath: string, email: string): Promise<boolean> {
  try {
    const raw = await readFile(filePath, 'utf8')
    const needle = email.trim().toLowerCase()
    return raw
      .split(/\r?\n/)
      .slice(1)
      .some((line) => line.trim() !== '' && emailFromRow(line) === needle)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
    throw error
  }
}

/** Append a row. Returns false if the email was already present. */
export async function appendEmailRow(
  filePath: string,
  email: string,
  timestamp: string,
): Promise<boolean> {
  return withWriteLock(async () => {
    await ensureCsv(filePath, 'timestamp,email')
    if (await csvHasEmail(filePath, email)) return false
    const row = `${csvEscape(timestamp)},${csvEscape(email)}\n`
    await appendFile(filePath, row, 'utf8')
    return true
  })
}
