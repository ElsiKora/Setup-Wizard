export const STYLELINT_CONFIG: string = `export default {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-rational-order',
    'stylelint-prettier/recommended',
    'stylelint-config-css-modules',
  ],
  plugins: [
    'stylelint-order',
    'stylelint-config-rational-order/plugin',
    'stylelint-prettier',
  ],
  defaultSeverity: 'warning',
};
`;
