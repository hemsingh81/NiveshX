/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        // Example: use bg-noise in your className
        noise: "url('/textures/noise.svg')",
        radial: "radial-gradient(circle at center, #e0e7ff, #c7d2fe)",
      },
      colors: {
        primary: {
          DEFAULT: '#1e3a8a', // Indigo-800
        },
      },
    },
  },
  plugins: [],
};
