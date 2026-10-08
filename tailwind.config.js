/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "rgb(var(--color-cream-rgb) / <alpha-value>)",
        ink: "rgb(var(--color-navy-rgb) / <alpha-value>)",
        crimson: {
          DEFAULT: "rgb(var(--color-crimson-rgb) / <alpha-value>)",
          dark: "rgb(var(--color-crimson-dark-rgb) / <alpha-value>)",
          light: "rgb(var(--color-crimson-light-rgb) / <alpha-value>)",
        },
        gold: {
          DEFAULT: "rgb(var(--color-gold-rgb) / <alpha-value>)",
          dark: "rgb(var(--color-gold-dark-rgb) / <alpha-value>)",
          light: "rgb(var(--color-gold-light-rgb) / <alpha-value>)",
        },
        clay: "rgb(var(--color-orange-rgb) / <alpha-value>)",
        navy: {
          DEFAULT: "rgb(var(--color-navy-rgb) / <alpha-value>)",
          light: "rgb(var(--color-navy-light-rgb) / <alpha-value>)",
        },
        forest: "#1F7A4D",
      },
      fontFamily: {
        display: ["Roboto", "sans-serif"],
        body: ["Roboto", "sans-serif"],
        eyebrow: ["Roboto", "sans-serif"],
      },
      backgroundImage: {
        "grain": "radial-gradient(circle at 1px 1px, rgba(11,31,58,0.06) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
}
