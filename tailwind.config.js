/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        "geist-black": ["black" , "serif"],
        "geist-medium": ["medium" , "serif"],
        "geist-regular": ["regular" , "serif"],
      }
    }
  },
  plugins: []
};