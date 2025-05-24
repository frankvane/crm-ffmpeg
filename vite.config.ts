import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteCompression()],
  // 别名、后缀
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".js", ".ts", ".jsx", ".tsx"],
  },
  css: {
    modules: {
      localsConvention: "camelCase",
      generateScopedName: "[local]_[hash:base64:5]",
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  define: {
    "process.env": process.env,
  },
  build: {
    sourcemap: process.env.NODE_ENV !== "production",
    outDir: "dist",
    assetsDir: "assets",
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          antd: ["antd", "@ant-design/icons"],
          axios: ["axios", "axios-auth-refresh"],
          immer: ["immer"],
          zustand: ["zustand"],
          lodash: ["lodash"],
          dayjs: ["dayjs"],
          localforage: ["localforage"],
          tanstack: ["@tanstack/react-query", "@tanstack/react-query-devtools"],
          keepalive: ["keepalive-for-react"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["lodash"],
  },
});
