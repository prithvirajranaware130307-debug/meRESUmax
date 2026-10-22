/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          main: '#090A0E',
          surface: '#111318',
          elevated: '#161922',
          subtle: '#1D212C',
        },
        glass: {
          surface: 'rgba(255, 255, 255, 0.035)',
          hover: 'rgba(255, 255, 255, 0.065)',
          border: 'rgba(255, 255, 255, 0.08)',
          active: 'rgba(255, 255, 255, 0.09)',
          deep: 'rgba(17, 19, 24, 0.90)',
        },
        text: {
          primary: '#F3F4F6',
          secondary: '#8E94A4',
          muted: '#525866',
        },
        brand: {
          blue: '#3B82F6',
          cyan: '#06B6D4',
          violet: '#8B5CF6',
          mint: '#10B981',
          amber: '#F59E0B',
          rose: '#EF4444',
          accent: '#2563EB',
          yellow: '#E8FF47',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glass-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'glass-md': '0 4px 16px -2px rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
        'glass-lg': '0 12px 32px -4px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'glow-blue': '0 0 20px -5px rgba(59, 130, 246, 0.15)',
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.15)',
        'glow-violet': '0 0 20px -5px rgba(139, 92, 246, 0.15)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 4px 12px -2px rgba(0, 0, 0, 0.3)',
      },
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '12px',
        'deep': '20px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
