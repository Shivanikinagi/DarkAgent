import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Polyfills for wagmi/viem compatibility
      process: "process/browser",
    },
  },
  define: {
    // Required for some web3 libraries
    "process.env": {},
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["wagmi", "viem", "@tanstack/react-query"],
  },
  build: {
    rollupOptions: {
      // Ensure proper chunking for web3 dependencies
      output: {
        manualChunks: {
          web3: ["wagmi", "viem", "@tanstack/react-query"],
        },
      },
    },
  },
});
