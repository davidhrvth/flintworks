import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  drift: number
  life: number
  maxLife: number
}

function createParticle(width: number, height: number): Particle {
  return {
    x: Math.random() * width,
    y: height + Math.random() * 20,
    size: Math.random() * 2.5 + 0.5,
    speed: Math.random() * 0.8 + 0.4,
    opacity: Math.random() * 0.35 + 0.1,
    drift: (Math.random() - 0.5) * 0.4,
    life: 0,
    maxLife: Math.random() * 200 + 100,
  }
}

export function EmberParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const MAX_PARTICLES = 40

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    for (let i = 0; i < MAX_PARTICLES / 2; i++) {
      const p = createParticle(canvas.width, canvas.height)
      p.y = Math.random() * canvas.height
      p.life = Math.random() * p.maxLife
      particlesRef.current.push(p)
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      while (particlesRef.current.length < MAX_PARTICLES) {
        particlesRef.current.push(createParticle(canvas.width, canvas.height))
      }

      particlesRef.current = particlesRef.current.filter((p) => {
        p.y -= p.speed
        p.x += p.drift
        p.life++

        const progress = p.life / p.maxLife
        const fade = progress < 0.1 ? progress / 0.1 : progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1
        const alpha = p.opacity * fade

        ctx.beginPath()
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
        gradient.addColorStop(0, `rgba(255, 120, 30, ${alpha})`)
        gradient.addColorStop(0.5, `rgba(255, 77, 0, ${alpha * 0.6})`)
        gradient.addColorStop(1, `rgba(255, 77, 0, 0)`)

        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        return p.life < p.maxLife && p.y > -10
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  )
}
