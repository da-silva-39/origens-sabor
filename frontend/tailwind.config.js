/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primaria: "#A9502F",
        secundaria: "#1E3A2B",
        fundo: "#F8F3E8",
        texto: "#26231E",
        verde: "#1E3A2B",
        "verde-claro": "#2F5A43",
        terracota: "#A9502F",
        "terracota-claro": "#C2643A",
        creme: "#F8F3E8",
        carvao: "#26231E",
        dourado: "#C19A5B",
        areia: "#E9DFCC",
        oliva: "#6B7A52",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "Cambria", "serif"],
      },
      maxWidth: {
        conteudo: "76rem",
      },
      boxShadow: {
        suave: "0 18px 45px -30px rgba(38, 35, 30, 0.45)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.7s ease-out both",
      },
    },
  },
  plugins: [],
};
