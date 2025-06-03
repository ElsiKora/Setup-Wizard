export const GITIGNORE_CONFIG_MESSAGES: {
	confirmGenerate: string;
	deletedExisting: string;
	existingFileFound: (filePath: string) => string;
	failedCheckExisting: string;
	failedComplete: string;
	failedConfirmation: string;
	failedDeleteExisting: string;
	fileGenerated: string;
	generatingFile: string;
	keepingExisting: string;
} = {
	confirmGenerate: "Do you want to generate .gitignore file for your project?",
	deletedExisting: "Deleted existing .gitignore file.",
	existingFileFound: (filePath: string): string => `An existing .gitignore file was found (${filePath}). Would you like to replace it?`,
	failedCheckExisting: "Failed to check existing .gitignore setup",
	failedComplete: "Failed to complete .gitignore installation",
	failedConfirmation: "Failed to get user confirmation",
	failedDeleteExisting: "Failed to delete existing .gitignore file",
	fileGenerated: ".gitignore file generated",
	generatingFile: "Generating .gitignore file...",
	keepingExisting: "Keeping existing .gitignore file.",
};
