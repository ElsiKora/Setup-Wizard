import {IEslintFeatureGroup} from "../interface/eslint-feature-group.interface";
import {EEslintFeature} from "../enum/eslint-feature.enum";

export const ESLINT_FEATURE_GROUPS: IEslintFeatureGroup[] = [
    {
        name: "Code Quality",
        features: [EEslintFeature.SONAR, EEslintFeature.UNICORN, EEslintFeature.PERFECTIONIST]
    },
    {
        name: "Core Features",
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT]
    },
    {
        name: "File Types",
        features: [EEslintFeature.JSON, EEslintFeature.YAML, EEslintFeature.CHECK_FILE, EEslintFeature.PACKAGE_JSON]
    },
    {
        name: "Frameworks",
        features: [EEslintFeature.REACT, EEslintFeature.NEST]
    },
    {
        name: "Other Tools",
        features: [EEslintFeature.NODE, EEslintFeature.REGEXP, EEslintFeature.TYPEORM]
    },
    {
        name: "Styling",
        features: [EEslintFeature.TAILWIND_CSS, EEslintFeature.PRETTIER, EEslintFeature.STYLISTIC]
    }
];
