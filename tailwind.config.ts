import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0D16',
        panel: '#12162A',
        border: '#232A45',
        foreground: '#F5F6FA',
        'main-text': '#F5F6FA',
        muted: '#8B8FA3',
        'muted-text': '#8B8FA3',
        accent: {
          DEFAULT: '#2D6BFF',
          dim: '#1E4FCC',
        },
        'accent-blue': '#2D6BFF',
        alert: {
          DEFAULT: '#E5484D',
          dim: '#B23438',
        },
        'accent-red': '#E5484D',
        // Kovari-prefixed tokens - same palette, third naming convention
        'kovari-bg': '#0A0D16',
        'kovari-panel': '#12162A',
        'kovari-border': '#232A45',
        'kovari-text': '#F5F6FA',
        'kovari-muted': '#8B8FA3',
        'kovari-blue': '#2D6BFF',
        'kovari-red': '#E5484D',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      boxShadow: {
        'glow-accent': '0 0 32px rgba(45,107,255,0.14)',
        'glow-alert': '0 0 32px rgba(229,72,77,0.14)',
        'glow-blue-sm': '0 0 16px rgba(45,107,255,0.18)',
        'glow-red-sm': '0 0 16px rgba(229,72,77,0.18)',
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
};

export default config;
