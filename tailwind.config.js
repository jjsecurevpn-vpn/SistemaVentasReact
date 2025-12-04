/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0a0a0a",
          surface: "#111111",
          container: "#171717",
          border: "#262626",
          "border-subtle": "#1a1a1a",
          text: "#ffffff",
          "text-secondary": "#a3a3a3",
          "text-muted": "#737373",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};
