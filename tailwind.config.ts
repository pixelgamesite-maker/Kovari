import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0B0C11',
        panel: '#15161D',
        foreground: '#F5F6FA',
        muted: '#8B8FA3',
        border: '#262833',
        accent: {
          DEFAULT: '#2D6BFF',
          dim: '#1E4FCC',
        },
        alert: {
          DEFAULT: '#E5484D',
          dim: '#B23438',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      boxShadow: {
        'glow-accent': '0 0 32px rgba(45,107,255,0.14)',
        'glow-alert': '0 0 32px rgba(229,72,77,0.14)',
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
};

export default config;
