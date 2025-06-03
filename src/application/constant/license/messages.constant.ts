interface ILicenseConfigMessages {
	confirmLicenseGeneration: string;
	confirmReplaceExisting: (filename: string) => string;
	deletedExistingLicense: string;
	enterCopyrightHolderName: string;
	failedCheckExistingSetup: string;
	failedCompleteInstallation: string;
	failedConfiguration: string;
	failedDeleteExistingLicense: string;
	failedGetAuthorFromPackageJson: string;
	failedGetUserConfirmation: string;
	failedSelectLicense: string;
	generatingLicenseSpinner: string;
	keepingExistingLicense: string;
	licenseDetails: string;
	licenseFileGenerated: string;
	licenseSetupSummaryTitle: string;
	rememberToReview: string;
	selectLicensePrompt: string;
	successfulConfiguration: string;
	unknownError: string;
	updatedPackageJsonField: string;
}

export const LICENSE_CONFIG_MESSAGES: ILicenseConfigMessages = {
	confirmLicenseGeneration: "Do you want to generate LICENSE for your project?",
	confirmReplaceExisting: (filename: string) => `An existing license file was found (${filename}). Would you like to replace it?`,
	deletedExistingLicense: "Deleted existing license file.",
	enterCopyrightHolderName: "Enter the copyright holder's name:",
	failedCheckExistingSetup: "Failed to check existing license setup",
	failedCompleteInstallation: "Failed to complete license installation",
	failedConfiguration: "Failed configuration:",
	failedDeleteExistingLicense: "Failed to delete existing license file",
	failedGetAuthorFromPackageJson: "Failed to get author from package.json, using saved or default",
	failedGetUserConfirmation: "Failed to get user confirmation",
	failedSelectLicense: "Failed to select license",
	generatingLicenseSpinner: "Generating license file...",
	keepingExistingLicense: "Keeping existing license file.",
	licenseDetails: "License details:",
	licenseFileGenerated: "License file generated",
	licenseSetupSummaryTitle: "License Setup Summary",
	rememberToReview: "Remember to:",
	selectLicensePrompt: "Select a license for your project:",
	successfulConfiguration: "Successfully created configuration:",
	unknownError: "Unknown error",
	updatedPackageJsonField: 'Updated package.json "license" field',
};
