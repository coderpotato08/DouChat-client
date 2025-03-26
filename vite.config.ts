import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-styled-components"],
      },
    }),
  ],
  root: path.resolve(__dirname),
  base: "/",
  resolve: {
    alias: {
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@router": path.resolve(__dirname, "./src/router"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@helper": path.resolve(__dirname, "./src/helper"),
      "@constant": path.resolve(__dirname, "./src/constant"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@service": path.resolve(__dirname, "./src/service"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3030",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
