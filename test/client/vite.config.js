import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,

    proxy: {
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
        changeOrigin: true
      }
    }
  }
});