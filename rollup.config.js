import typescript from "@rollup/plugin-typescript";

export default {
	external: ["node:fs", "node:fs/promises", "node:path", "node:child_process", "node:util", "commander", "@clack/prompts"],
	input: "src/presentation/index.ts",
	output: {
		banner: "#!/usr/bin/env node",
		dir: "bin", // Вместо file используем dir
		exports: "auto",
		format: "esm",
		preserveModules: true, // Сохраняет структуру модулей
		preserveModulesRoot: "src", // Корневая директория для модулей
		sourcemap: true,
	},
	plugins: [
		typescript({
			declaration: true, // Включаем генерацию типов
			outDir: "bin", // Указываем выходную директорию для TypeScript
			sourceMap: true,
			tsconfig: "./tsconfig.json",
		}),
	],
};
