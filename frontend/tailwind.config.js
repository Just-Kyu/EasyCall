/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand orange (Easy Call new design — #F25C1F)
        brand: {
          50: '#FFF3EB',
          100: '#FFE9DC',
          200: '#FFD2BA',
          300: '#FFB48A',
          400: '#FF8E55',
          500: '#F25C1F',
          600: '#DA4D14',
          700: '#B43E0F',
          800: '#8C300C',
          900: '#5E2008',
        },
        // Deep slate anchor — text + dark surfaces
        slate2: {
          50: '#F4F6FA',
          100: '#E9EEF5',
          200: '#D5DDE8',
          300: '#A9B7CA',
          400: '#768AA3',
          500: '#4A607C',
          600: '#2C4361',
          700: '#1F3148',
          800: '#15263B',
          900: '#0E1B2C',
        },
        // Surfaces / borders / text — semantic aliases that read in code
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F4F6FA',
          muted: '#E9EEF5',
          base: '#FAFAF7',
        },
        ink: {
          50: '#F4F6FA',
          100: '#E9EEF5',
          200: '#D5DDE8',
          300: '#A9B7CA',
          400: '#768AA3',
          500: '#4A607C',
          600: '#2C4361',
          700: '#1F3148',
          800: '#15263B',
          900: '#0E1B2C',
          950: '#0A1320',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        lg: '14px',
        xl: '20px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(14,27,44,0.06)',
        DEFAULT: '0 4px 14px rgba(14,27,44,0.08)',
        lg: '0 18px 40px rgba(14,27,44,0.14)',
        glow: '0 1px 0 rgba(255,255,255,0.25) inset, 0 1px 2px rgba(242,92,31,0.4)',
      },
      animation: {
        'pulse-ring': 'pulseRing 1.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'fade-in': 'fadeIn 0.18s ease-out',
        'slide-up': 'slideUp 0.22s ease-out',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
