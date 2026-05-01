/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        // AdvisorSuite design tokens — kept in sync with src/index.css :root
        ink: {
          DEFAULT: '#2b231d',
          80: 'rgba(43,35,29,0.82)',
          60: 'rgba(43,35,29,0.62)',
          40: 'rgba(43,35,29,0.46)',
          10: 'rgba(43,35,29,0.08)',
        },
        surface: {
          DEFAULT: '#faf5ee',
          2: '#f2eadd',
        },
        cream: '#fbf7f0',
        green: {
          DEFAULT: '#2f8a5f',
          light: '#e6f1ea',
          dark: '#236a49',
        },
        indigo: {
          DEFAULT: '#5b6cc9',
          light: '#ecedfb',
        },
        amber: {
          DEFAULT: '#e69b34',
          light: '#fdf2dd',
        },
        red: {
          DEFAULT: '#d96c5b',
          light: '#fbe8e4',
        },
        blue: {
          DEFAULT: '#4f8cc6',
          light: '#e8f2fb',
        },
        terracotta: {
          DEFAULT: '#d77a5a',
          light: '#fbe7dd',
        },
      },
      borderRadius: {
        'r-sm': '10px',
        'r-md': '14px',
        'r-lg': '20px',
        'r-xl': '28px',
      },
      boxShadow: {
        'sm-warm': '0 2px 6px rgba(43,35,29,0.05)',
        'md-warm': '0 6px 22px rgba(43,35,29,0.07), 0 2px 8px rgba(43,35,29,0.04)',
        'lg-warm': '0 22px 60px rgba(43,35,29,0.10), 0 6px 18px rgba(43,35,29,0.05)',
        'xl-warm': '0 38px 90px rgba(43,35,29,0.14)',
      },
    },
  },
  plugins: [],
}
