/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Warm dark palette
        'garden': {
          'black': '#121212',      // True foundation
          'charcoal': '#1C1C1C',   // Primary background
          'surface': '#2A2724',    // Elevated surfaces with brown undertone
          'border': '#3D3A36',     // Subtle borders
        },
        'text': {
          'primary': '#F5F0E8',    // Warm white (cream-tinted)
          'secondary': '#A0A0A0',  // Muted secondary
          'tertiary': '#6B6B6B',   // Subtle tertiary
        },
        'accent': {
          'amber': '#D4A574',      // Primary accent - hospitality warmth
          'terracotta': '#C4725B', // Secondary accent
          'sage': '#7D8B75',       // Horticulture reference
        },
        // Maturity indicator colors
        'maturity': {
          'seedling': '#7D8B75',   // Fresh green - new ideas
          'budding': '#D4A574',    // Amber - developing
          'evergreen': '#F5F0E8',  // Full warmth - mature
        }
      },
      fontFamily: {
        'serif': ['Instrument Serif', 'Playfair Display', 'Georgia', 'serif'],
        'sans': ['DM Sans', 'Source Sans Pro', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        // Fluid typography scale
        'display': ['clamp(3rem, 8vw, 6rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h1': ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'h2': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.2' }],
        'h3': ['clamp(1.25rem, 2vw, 1.5rem)', { lineHeight: '1.3' }],
        'body': ['1.125rem', { lineHeight: '1.7' }],
        'small': ['0.875rem', { lineHeight: '1.5' }],
      },
      spacing: {
        // Premium spacing scale (8px base)
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(212, 165, 116, 0.1)' },
          '100%': { boxShadow: '0 0 30px rgba(212, 165, 116, 0.2)' },
        },
      },
    },
  },
  plugins: [],
}
