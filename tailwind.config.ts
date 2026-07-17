import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Obsidian + Champagne Gold ──────────────────────────────
        background: '#0B0B0D',       // Obsidian — deepest background
        panel: '#17181C',            // Surface — cards, panels
        border: '#1E1E22',           // Subtle borders
        foreground: '#F5F5F3',       // Primary text
        'main-text': '#F5F5F3',
        muted: '#7A7A80',            // Secondary text
        'muted-text': '#7A7A80',

        // Gold accent — replaces blue everywhere
        'accent-blue': '#D4AF37',    // Named accent-blue for compat, now gold
        accent: {
          DEFAULT: '#D4AF37',
          dim: '#A88B2A',
        },

        // Gold shades for hover/glow states
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F0D060',
          dim: '#A88B2A',
          muted: '#7A6520',
        },

        // Alert red — unchanged
        alert: {
          DEFAULT: '#E5484D',
          dim: '#B23438',
        },
        'accent-red': '#E5484D',

        // Legacy Kovari tokens — same new palette
        'kovari-bg': '#0B0B0D',
        'kovari-panel': '#17181C',
        'kovari-border': '#1E1E22',
        'kovari-text': '#F5F5F3',
        'kovari-muted': '#7A7A80',
        'kovari-blue': '#D4AF37',
        'kovari-red': '#E5484D',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      boxShadow: {
        'glow-accent': '0 0 32px rgba(212,175,55,0.14)',
        'glow-gold': '0 0 32px rgba(212,175,55,0.20)',
        'glow-gold-sm': '0 0 16px rgba(212,175,55,0.18)',
        'glow-alert': '0 0 32px rgba(229,72,77,0.14)',
        'glow-blue-sm': '0 0 16px rgba(212,175,55,0.18)',
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
