export default {
	"*": (files) => {
		const commands = [];

		commands.push("prettier --write --ignore-unknown");

		const eslintFiles = files.filter((file) => {
			const validExtensions = ["js", "jsx", "mjs", "cjs", "ts", "tsx", "json", "jsonc", "yml", "yaml", "md", "mdx"];

			const fileExtension = file.split(".").pop();
			const hasValidExtension = validExtensions.includes(fileExtension);
			const hasNoExtension = !file.includes(".");

			return hasValidExtension && !hasNoExtension;
		});

		const styleFiles = files.filter((file) => {
			const validExtensions = ["css", "scss", "sass", "less", "style", "pcss", "styled", "stylus"];

			const fileExtension = file.split(".").pop();

			return validExtensions.includes(fileExtension);
		});

		if (eslintFiles.length > 0) {
			commands.push(`eslint --fix --max-warnings=0 ${eslintFiles.join(" ")}`);
		}

		if (styleFiles.length > 0) {
			commands.push(`stylelint --fix ${styleFiles.join(" ")}`);
		}

		return commands;
	},
};
