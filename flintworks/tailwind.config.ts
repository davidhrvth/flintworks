import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0B',
        surface: '#111114',
        border: '#1E1E24',
        ember: '#FF4D00',
        flame: '#FF8C42',
        'text-muted': '#6B6B7A',
        'text-body': '#C4C4CF',
        'text-heading': '#F0F0F5',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'float-up': 'floatUp 4s ease-in infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spark-burst': 'sparkBurst 0.6s ease-out forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.4' },
          '100%': { transform: 'translateY(-100vh) scale(0.3)', opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 77, 0, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 77, 0, 0.6)' },
        },
        sparkBurst: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(3)', opacity: '0' },
        },
      },
      backgroundImage: {
        'ember-gradient': 'linear-gradient(135deg, #FF4D00 0%, #FF8C42 100%)',
        'ember-radial': 'radial-gradient(circle at center, rgba(255,77,0,0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}

export default config
