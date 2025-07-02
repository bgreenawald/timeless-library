/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'background-paper': 'rgb(var(--background-paper) / <alpha-value>)',
        'text-ink': 'rgb(var(--text-ink) / <alpha-value>)',
        'accent-gold': 'rgb(var(--accent-gold) / <alpha-value>)',
        'accent-gold-hover': 'rgb(var(--accent-gold-hover) / <alpha-value>)',
        'border-color': 'rgb(var(--border-color) / <alpha-value>)',
      },
      fontFamily: {
        lora: ['Lora', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};