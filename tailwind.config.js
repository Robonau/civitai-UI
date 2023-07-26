/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      aspectRatio: {
        cover: '210 / 297'
      },
      fontSize: {
        '2xs': '0.70rem'
      }
    },
  },
  plugins: [require("daisyui")],
}

