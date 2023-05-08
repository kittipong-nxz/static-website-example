/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/*.{html,js}"],
  theme: {
    extend: {
      height: {
        17: '4.25rem',
      },
      borderRadius: {},
      colors: {
        'coral-blue': '#055FFC',
        'sea-blue': '#1DD9CD',
      },
    },
    fontFamily: {
      baloo: ["'Baloo Tamma 2'", 'cursive'],
    },
  },
  plugins: [],
}
