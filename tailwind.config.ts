import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        ember: "#b94b35",
        brass: "#c89b46",
        fog: "#f6f4ef"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(17, 17, 17, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
