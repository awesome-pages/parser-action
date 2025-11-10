import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  outDir: "dist",
  outExtension: () => ({ js: ".cjs" }),
  target: "node20",
  clean: true,
  sourcemap: false,
  minify: false,
  bundle: true,
  splitting: false,
  dts: false,
  treeshake: true,
  platform: "node",
  noExternal: [/.*/], // Bundle all dependencies for GitHub Actions
});
