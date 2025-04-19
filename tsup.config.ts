import { defineConfig } from "tsup";

export default defineConfig({
  entry: ['src/index.ts', 'src/maybe/index.ts', 'src/either/index.ts', 'src/result/index.ts'],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
});
