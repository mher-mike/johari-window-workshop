import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        quiet: "#6b7280",
        line: "#e2e2df",
        panel: "#f7f7f5",
        mist: "#f5f5f1"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.08)",
        button: "0 8px 20px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
