import dts from "bun-plugin-dts";

await Bun.build({
	entrypoints: [
		"./src/index.ts",
		"./src/maybe/index.ts",
		"./src/either/index.ts",
		"./src/result/index.ts",
	],
	outdir: "./dist",
	sourcemap: "linked",
	splitting: true,
	plugins: [dts()],
});
