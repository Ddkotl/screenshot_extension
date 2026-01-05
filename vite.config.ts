import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Убираем build.lib, используем rollupOptions.input
    rollupOptions: {
      input: {
        // 1. Основное приложение (ваш попап или опции)
        main: path.resolve(__dirname, "index.html"), 
        // 2. Ваши отдельные скрипты
        background: path.resolve(__dirname, "src/background.ts"),
        content: path.resolve(__dirname, "src/content.ts")
      },
      output: {
        // Убираем хеши из названий, чтобы пути в manifest.json всегда совпадали
        entryFileNames: (chunkInfo) => {
          if (['background', 'content'].includes(chunkInfo.name)) {
            return '[name].js'; // Будет dist/background.js
          }
          return 'assets/[name]-[hash].js'; // Для остальных файлов (интерфейса)
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
})
