import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Dark Palette
        'dark-bg': '#0a0e27', // Deep navy-black
        'dark-card': '#1a1f3a', // Card background
        'dark-border': '#2a3050', // Subtle border
        
        // Neon Accents
        'neon-cyan': '#00d9ff',
        'neon-gold': '#ffd700',
        'neon-purple': '#d946ef',
        'neon-pink': '#ff006e',
        
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      
      backgroundImage: {
        // Gradient backgrounds
        'gradient-dark': 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
        'gradient-neon': 'linear-gradient(135deg, #00d9ff 0%, #d946ef 100%)',
        'gradient-premium': 'linear-gradient(135deg, #1a1f3a 0%, #2a3050 100%)',
      },

      backdropBlur: {
        xs: '2px',
      },

      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 217, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(217, 70, 239, 0.5)',
        'neon-pink': '0 0 20px rgba(255, 0, 110, 0.5)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },

      borderColor: {
        'glass': 'rgba(255, 255, 255, 0.1)',
      },

      lineHeight: {
        tighter: "1",
      },

      keyframes: {
        'pulse-neon': {
          '0%, 100%': { 'box-shadow': '0 0 20px rgba(0, 217, 255, 0.5)' },
          '50%': { 'box-shadow': '0 0 30px rgba(0, 217, 255, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '1000% 0' },
          '100%': { backgroundPosition: '-1000% 0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },

      animation: {
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 8s linear infinite',
        'slide-up': 'slide-up 0.5s ease-out',
      },
    },
  },
  plugins: [
    function({ addUtilities, addComponents }: any) {
      // Glassmorphism utilities
      addUtilities({
        '.glass': {
          'background': 'rgba(26, 31, 58, 0.6)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-sm': {
          'background': 'rgba(26, 31, 58, 0.4)',
          'backdrop-filter': 'blur(5px)',
          'border': '1px solid rgba(255, 255, 255, 0.05)',
        },
        '.glass-dark': {
          'background': 'rgba(10, 14, 39, 0.7)',
          'backdrop-filter': 'blur(20px)',
          'border': '1px solid rgba(255, 255, 255, 0.08)',
        },
        
        // Neon utilities
        '.neon-border': {
          'border': '1px solid transparent',
          'background-image': 'linear-gradient(rgba(26, 31, 58, 0.6), rgba(26, 31, 58, 0.6)), linear-gradient(135deg, #00d9ff, #d946ef)',
          'background-origin': 'border-box',
          'background-clip': 'padding-box, border-box',
        },

        '.line-clamp-2': {
          'display': '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical',
          'overflow': 'hidden',
        },

        '.line-clamp-3': {
          'display': '-webkit-box',
          '-webkit-line-clamp': '3',
          '-webkit-box-orient': 'vertical',
          'overflow': 'hidden',
        },

        // Floating/premium text effects
        '.text-glow': {
          'text-shadow': '0 0 20px rgba(0, 217, 255, 0.5)',
        },

        '.text-glow-pink': {
          'text-shadow': '0 0 20px rgba(255, 0, 110, 0.5)',
        },
      });

      // Component classes
      addComponents({
        '.btn-primary': {
          '@apply': 'px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-neon-cyan to-neon-purple text-white transition-all duration-300 hover:shadow-neon-cyan active:scale-95',
        },
        '.btn-secondary': {
          '@apply': 'px-6 py-3 rounded-lg font-semibold glass text-neon-cyan border border-neon-cyan hover:shadow-neon-cyan transition-all duration-300',
        },
        '.btn-ghost': {
          '@apply': 'px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-colors',
        },
        '.card-glass': {
          '@apply': 'glass rounded-2xl p-6',
        },
        '.card-premium': {
          '@apply': 'bg-gradient-dark rounded-2xl p-6 border border-dark-border',
        },
      });
    },
  ],
};

export default config;
