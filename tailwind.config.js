/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    screens: {
      sm: "480px",
      md: "768px",
      lg: "976px",
      xl: "1440px",
    },
    colors: {
      black: "#000000",
      white: "#FFFFFF",
      red:"#FF0000",
      "tuner-bg": "#120E1D",
      "entire-bg": "#2A283B",
      "controllers-bg": "#1A1725",
      "darl-blue": "#2A4296",
      "tuner-controller-text": "#A3D10A",
      purple: "#7210E3",
      blue: "#1fb6ff",
      pink: "#ff49db",
      orange: "#ff7849",
      green: "#13ce66",
      skyblue: "#36C4E4",
      "gray-dark": "#273444",
      gray: "#8492a6",
      "gray-light": "#D9D9D9",
    },
    fontFamily: {
    },
    extend: {

    },
  },
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],

  plugins: ["daisyui"],
};
