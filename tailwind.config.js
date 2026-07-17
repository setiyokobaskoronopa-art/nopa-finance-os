/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          50: "#EFF4FF",
          100: "#DBE6FE",
          200: "#BFD3FE",
          300: "#93B4FD",
          400: "#608BFA",
          500: "#3B6BF6",
          600: "#2563EB",
          700: "#1D4CC7",
          800: "#1D40A0",
          900: "#1E3A7E",
        },
        accent: {
          DEFAULT: "#F0562E",
          50: "#FFF3EE",
          100: "#FFE2D3",
          200: "#FFC1A3",
          300: "#FF9A6E",
          400: "#FA7A4B",
          500: "#F0562E",
          600: "#DC4420",
          700: "#B8351A",
          800: "#8F2A16",
          900: "#6E2212",
        },
        sidebar: {
          DEFAULT: "#0F1533",
          hover: "#1B2247",
          active: "#242C58",
          border: "#232A52",
        },
        secondary: {
          DEFAULT: "#0F172A",
          50: "#F5F7FA",
          100: "#E5E9F0",
          200: "#CBD5E1",
          300: "#94A3B8",
          400: "#64748B",
          500: "#475569",
          600: "#334155",
          700: "#1E293B",
          800: "#172033",
          900: "#0F172A",
          950: "#080D18",
        },
        success: {
          DEFAULT: "#22C55E",
          50: "#F0FDF4",
          100: "#DCFCE7",
          600: "#16A34A",
        },
        danger: {
          DEFAULT: "#EF4444",
          50: "#FEF2F2",
          100: "#FEE2E2",
          600: "#DC2626",
        },
        warning: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          100: "#FEF3C7",
          600: "#D97706",
        },
        surface: {
          DEFAULT: "#F8FAFC",
          dark: "#0B1120",
        },
        card: {
          DEFAULT: "#FFFFFF",
          dark: "#111827",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(15, 23, 42, 0.08)",
        softer: "0 1px 1px rgba(15, 23, 42, 0.03), 0 2px 8px -2px rgba(15, 23, 42, 0.06)",
        glow: "0 0 0 1px rgba(37, 99, 235, 0.08), 0 8px 32px -8px rgba(37, 99, 235, 0.25)",
        "glow-accent": "0 0 0 1px rgba(240, 86, 46, 0.1), 0 8px 32px -8px rgba(240, 86, 46, 0.35)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        shimmer: "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [],
};
