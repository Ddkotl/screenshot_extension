import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        // 1. Основное приложение (ваш попап или опции)
        main: path.resolve(__dirname, "index.html"),
        // 2. Ваши отдельные скрипты
        background: path.resolve(__dirname, "src/background.ts"),
        content: path.resolve(__dirname, "src/content.ts"),
      },
      output: {
        // Убираем хеши из названий, чтобы пути в manifest.json всегда совпадали
        entryFileNames: (chunkInfo) => {
          if (["background", "content"].includes(chunkInfo.name)) {
            return "[name].js";
          }

          return "assets/[name]-[hash].js"; // Для остальных файлов (интерфейса)
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          // Если это CSS файл и он был импортирован из content.ts
          // (Vite называет такие ассеты по имени входной точки)
          if (assetInfo.name === "content.css") {
            return "[name].[ext]"; // Выведет dist/content.css
          }
          return "assets/[name]-[hash].[ext]";
        },
      },
    },
  },
});
