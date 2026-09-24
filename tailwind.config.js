/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Black & Red theme
        primary: {
          50:  '#fff0f0',
          100: '#ffe0e0',
          200: '#ffc0c0',
          300: '#ff9090',
          400: '#ff5050',
          500: '#ff1a1a',
          600: '#e00000',
          700: '#b80000',
          800: '#960000',
          900: '#7a0000',
          950: '#4a0000',
        },
        // Dark surface scale
        surface: {
          50:  '#f5f5f5',
          100: '#e8e8e8',
          200: '#d4d4d4',
          300: '#b0b0b0',
          400: '#848484',
          500: '#5c5c5c',
          600: '#3a3a3a',
          700: '#252525',
          800: '#181818',
          900: '#101010',
          950: '#080808',
        },
        // Accent gold for premium feel
        gold: {
          400: '#f5c842',
          500: '#e5b730',
          600: '#c99b20',
        },
        teal: {
          50:  '#f0fdfa',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'crimson-gradient': 'linear-gradient(135deg, #e00000 0%, #7a0000 100%)',
        'dark-gradient': 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
        'card-gradient': 'linear-gradient(145deg, #1e1e1e 0%, #141414 100%)',
        'glow-red': 'radial-gradient(circle at 50% 0%, rgba(220,0,0,0.15) 0%, transparent 60%)',
      },
      boxShadow: {
        'premium': '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)',
        'premium-red': '0 4px 24px rgba(220,0,0,0.3), 0 1px 4px rgba(220,0,0,0.1)',
        'glow-red': '0 0 20px rgba(220,0,0,0.4)',
        'card': '0 2px 12px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
        'inset-top': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseRed: {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 0 0 rgba(220,0,0,0.4)' },
          '50%': { opacity: 0.8, boxShadow: '0 0 0 8px rgba(220,0,0,0)' },
        },
        slideUp: {
          from: { transform: 'translateY(8px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
