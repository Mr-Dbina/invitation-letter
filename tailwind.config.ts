import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "blush-light": "#FCE4E1",
        "blush-mid": "#F7B8B0",
        "blush-dark": "#E88A82",
        "heart-red": "#D9483F",
        ink: "#3A3A3A",
        paper: "#FFF9F6",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        script: ["var(--font-caveat)", "cursive"],
      },
    },
  },
  plugins: [],
};
export default config;