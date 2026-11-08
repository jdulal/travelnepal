import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f9ee",
          100: "#eaf6ef",
          200: "#d5ecd9",
          300: "#b3dcaa",
          400: "#8cc778",
          500: "#63ab45",
          600: "#4f9236",
          700: "#3f742c",
          800: "#2f5722",
          900: "#1f3d19",
        },
        forest: "#004f32",
        "forest-deep": "#063a27",
        ink: "#0e0700",
        body: "#333333",
        mist: "#f6fbf9",
        line: "#e5eef0",
        muted: "#64748b",
        sand: "#f4efe6",
      },
      fontFamily: {
        sans: ["var(--font-jost)", "system-ui", "sans-serif"],
        display: ["var(--font-jost)", "Georgia", "serif"],
        admin: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        script: ["var(--font-caveat)", "cursive"],
      },
      boxShadow: {
        card: "0 4px 24px -4px rgba(6, 58, 39, 0.08)",
        float: "0 18px 50px -12px rgba(6, 58, 39, 0.28)",
        soft: "0 2px 10px rgba(6, 58, 39, 0.06)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.75rem",
      },
      maxWidth: {
        shell: "1240px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-7px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up .6s ease both",
        float: "float 5s ease-in-out infinite",
        marquee: "marquee 36s linear infinite",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
