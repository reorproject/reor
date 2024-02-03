/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // "material-icons": ["Material Icons"],
      },
      height: {
        titlebar: "30px",
        "below-titlebar": "calc(100vh - 30px)",
      },
      minHeight: {
        "below-titlebar-min": "calc(100vh - 30px)",
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
