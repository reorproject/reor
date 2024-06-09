/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'deep-blue': '#002b36',

        'dark-gray-c-one': '#121212',
        'dark-gray-c-two': '#1e1e1e',
        'dark-gray-c-three': '#222222',
        'dark-gray-c-four': '#242424',
        'dark-gray-c-five': '#272727',
        'dark-gray-c-six': '#2c2c2c',
        'dark-gray-c-seven': '#2e2e2e',
        'dark-gray-c-eight': '#333333',
        'dark-gray-c-nine': '#343434',
        'dark-gray-c-ten': '#383838',
      },
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
