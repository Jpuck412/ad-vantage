/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111315",
        paper: "#ECE7E0",
        mist: "#C9C3BB",
        stone: "#23272B",
        slate: "#38424A",
        steel: "#5E7A95",
        blueGlow: "#88A9C7",
        signal: "#D98A43",
        signalDim: "#9E5F2B",
        line: "#3B4248",
        muted: "#98A1A9",
        danger: "#C35A4D",
        good: "#7AA37A",
        clay: "#A26E4B",
        brass: "#D0A061"
      },
      boxShadow: {
        rustic: "0 24px 60px rgba(0,0,0,0.35)",
        lift: "0 18px 45px rgba(0,0,0,0.28)",
        softGlow: "0 0 0 1px rgba(136,169,199,0.18), 0 18px 50px rgba(70,110,150,0.14)",
        emberGlow: "0 0 0 1px rgba(217,138,67,0.16), 0 16px 40px rgba(217,138,67,0.12)"
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
