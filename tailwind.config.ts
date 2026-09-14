import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bcdfff",
          300: "#8ecdff",
          400: "#59b2fc",
          500: "#3394f6",
          600: "#1d76eb",
          700: "#165fd8",
          800: "#194eae",
          900: "#1a4489",
          950: "#142c53",
        },
        accent: {
          50: "#effcf8",
          100: "#c9f7eb",
          200: "#93edda",
          300: "#55dcc5",
          400: "#26c3ac",
          500: "#12a792",
          600: "#0a8678",
          700: "#0c6b62",
          800: "#0d554f",
          900: "#0e4742",
          950: "#032a28",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(16 24 40 / 0.08), 0 1px 2px -1px rgb(16 24 40 / 0.06)",
      },
    },
  },
  plugins: [typography],
};

export default config;
