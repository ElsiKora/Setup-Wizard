import { EEslintFeature } from "../../domain/enum/eslint-feature.enum";
import { ESLINT_FEATURE_CONFIG } from "../../domain/constant/eslint-feature-config.constant";

export const ESLINT_CONFIG = {
  template: (ignores: Array<string>, features: Array<EEslintFeature>) => {
    const featureConfig = features
      .map(
        (feature: EEslintFeature) =>
          `  ${ESLINT_FEATURE_CONFIG[feature].configFlag}: true`,
      )
      .join(",\n");

    return `import { createConfig } from '@elsikora/eslint-config';

const config = {
  ignores: ${JSON.stringify(ignores, null, 2)}
};

export default [...config,
...(await createConfig({
${featureConfig}
})]);`;
  },
};
