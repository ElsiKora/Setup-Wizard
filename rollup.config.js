import typescript from "@rollup/plugin-typescript";

export default {
	external: ["node:fs", "node:fs/promises", "node:path", "node:child_process", "node:util", "commander", "@clack/prompts"],
	input: "src/presentation/index.ts",
	output: {
		banner: "#!/usr/bin/env node",
		exports: "auto",
		dir: "bin", // Вместо file используем dir
		format: "esm",
		sourcemap: true,
		preserveModules: true, // Сохраняет структуру модулей
		preserveModulesRoot: "src", // Корневая директория для модулей
	},
	plugins: [
		typescript({
			declaration: true, // Включаем генерацию типов
			sourceMap: true,
			tsconfig: "./tsconfig.json",
			outDir: "bin", // Указываем выходную директорию для TypeScript
		}),
	],
};
