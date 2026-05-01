import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss()],
  base:
    process.env.GITHUB_ACTIONS === "true"
      ? `/${process.env.GITHUB_REPOSITORY?.split("/")[1] ?? ""}/`
      : "/",
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL("./src/index.html", import.meta.url)),
        demo: fileURLToPath(new URL("./src/demo.html", import.meta.url)),
      },
    },
  },
});
