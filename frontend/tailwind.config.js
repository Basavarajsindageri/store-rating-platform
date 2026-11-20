/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'sans-serif'],
      },
      colors: {
        admin: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          light: '#EEF2FF',
          dark: '#312E81',
        },
        user: {
          DEFAULT: '#0D9488',
          hover: '#0F766E',
          light: '#F0FDFA',
          dark: '#134E4A',
        },
        owner: {
          DEFAULT: '#059669',
          hover: '#047857',
          light: '#ECFDF5',
          dark: '#064E3B',
        },
        brand: {
          accent: 'var(--theme-accent)',
          'accent-hover': 'var(--theme-accent-hover)',
          'accent-light': 'var(--theme-accent-light)',
          'accent-border': 'var(--theme-accent-border)',
        },
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
