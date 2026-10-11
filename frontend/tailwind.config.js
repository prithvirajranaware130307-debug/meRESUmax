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
          main: '#070912',
          secondary: '#0B1020',
          elevated: '#11182A',
        },
        glass: {
          surface: 'rgba(255, 255, 255, 0.065)',
          hover: 'rgba(255, 255, 255, 0.10)',
          border: 'rgba(255, 255, 255, 0.16)',
          active: 'rgba(255, 255, 255, 0.14)',
          deep: 'rgba(11, 16, 32, 0.75)',
        },
        text: {
          primary: '#F7F8FF',
          secondary: '#A5AEC4',
          muted: '#68738D',
        },
        brand: {
          blue: '#80AFFF',
          cyan: '#76E4F7',
          violet: '#B8A0FF',
          mint: '#91F5CD',
          amber: '#FFD38A',
          rose: '#FFA2A2',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        'glass-md': '0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.20)',
        'glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.55), inset 0 1px 2px 0 rgba(255, 255, 255, 0.25)',
        'glow-blue': '0 0 40px -10px rgba(128, 175, 255, 0.35)',
        'glow-cyan': '0 0 40px -10px rgba(118, 228, 247, 0.35)',
        'glow-violet': '0 0 40px -10px rgba(184, 160, 255, 0.35)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '16px',
        'deep': '24px',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orb-drift': 'orb 15s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        orb: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(40px, -30px) scale(1.08)' },
          '100%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
      },
    },
  },
  plugins: [],
}
