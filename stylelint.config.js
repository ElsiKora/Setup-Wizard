export default {
	defaultSeverity: "warning",
	extends: ["stylelint-config-standard-scss", "stylelint-config-rational-order", "stylelint-prettier/recommended", "stylelint-config-css-modules"],
	plugins: ["stylelint-order", "stylelint-config-rational-order/plugin", "stylelint-prettier"],
};
