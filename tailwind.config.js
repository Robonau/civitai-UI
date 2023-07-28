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
      },
      screens: {
        'sm': '550px',
        'md': '868px',
        'lg': '1124px',
        'xl': '1380px',
        '2xl': '1696px',
      }
    },
  },
  plugins: [require("daisyui")],
}

