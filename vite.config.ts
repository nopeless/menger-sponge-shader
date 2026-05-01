import { defineConfig } from "vite";

export default defineConfig({
  base:
    process.env.GITHUB_ACTIONS === "true"
      ? `/${process.env.GITHUB_REPOSITORY?.split("/")[1] ?? ""}/`
      : "/",
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
