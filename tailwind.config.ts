import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101417",
        mint: "#2BE7A7",
        coral: "#FF6B5E",
        lemon: "#F7D84B"
      },
      boxShadow: {
        glass: "0 24px 80px rgba(16, 20, 23, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
