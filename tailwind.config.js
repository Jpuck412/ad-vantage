/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171615",
        paper: "#E7E3DA",
        mist: "#CFCAC0",
        stone: "#2A2723",
        ash: "#77716A",
        signal: "#B48A46",
        signalDim: "#6F5630",
        line: "#3A3631",
        muted: "#A39C91",
        danger: "#B75545",
        good: "#7D9A6D",
        clay: "#9A6A4F",
        brass: "#C2A15A"
      },
      boxShadow: {
        rustic: "0 20px 60px rgba(0, 0, 0, 0.35)",
        insetGlow: "inset 0 1px 0 rgba(255, 255, 255, 0.08)"
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
