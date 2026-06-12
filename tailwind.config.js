/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Avenir Next", "Helvetica Neue", "Segoe UI", "sans-serif"],
        serif: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "serif"]
      },
      colors: {
        canvas: "#ffffff",
        sand: "#f7f7f7",
        ink: "#0a0a0a",
        clay: "#0a0a0a",
        forest: "#1f1f1f",
        mist: "#f3f3f3"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(10, 10, 10, 0.08)"
      },
      backgroundImage: {
        "grain-gradient": "radial-gradient(circle at top, rgba(0, 0, 0, 0.08), transparent 30%), radial-gradient(circle at bottom right, rgba(0, 0, 0, 0.04), transparent 28%)"
      }
    }
  },
  plugins: []
};
