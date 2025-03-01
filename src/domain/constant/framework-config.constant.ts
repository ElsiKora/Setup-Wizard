/* eslint-disable @elsikora-sonar/no-duplicate-string */
import type { IFrameworkConfig } from "../interface/framework-config.interface";

import { EEslintFeature } from "../enum/eslint-feature.enum";
import { EFramework } from "../enum/framework.enum";

export const FRAMEWORK_CONFIG: Record<EFramework, IFrameworkConfig> = {
	[EFramework.ADONIS]: {
		description: "AdonisJS Node.js framework project",
		displayName: "AdonisJS",
		features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT],
		fileIndicators: [".adonisrc.json"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["app/**/*.ts", "start/**/*.ts"],
		name: EFramework.ADONIS,
		packageIndicators: {
			dependencies: ["@adonisjs/core"],
		},
	},

	[EFramework.ALPINE]: {
		description: "Alpine.js lightweight frontend framework",
		displayName: "Alpine.js",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*.js", "public/**/*.js"],
		name: EFramework.ALPINE,
		packageIndicators: {
			dependencies: ["alpinejs"],
		},
	},

	// Angular
	[EFramework.ANGULAR]: {
		description: "Angular framework project",
		displayName: "Angular",
		features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER, EEslintFeature.SONAR, EEslintFeature.STYLISTIC],
		fileIndicators: ["angular.json", ".angular-cli.json", "angular-cli.json"],
		ignorePath: {
			directories: [".angular"],
			patterns: ["src/assets/**/*", "src/environments/**/*", "*.spec.ts"],
		},
		lintPaths: ["src/**/*.ts", "src/**/*.html", "src/**/*.scss"],
		name: EFramework.ANGULAR,
		packageIndicators: {
			dependencies: ["@angular/core"],
			devDependencies: ["@angular-devkit/build-angular"],
		},
	},

	[EFramework.ANTD]: {
		description: "Ant Design React UI library project",
		displayName: "Ant Design",
		features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.ANTD,
		packageIndicators: {
			dependencies: ["antd"],
		},
	},

	// ------------------
	// API/GraphQL
	// ------------------
	[EFramework.APOLLO]: {
		description: "Apollo GraphQL client/server project",
		displayName: "Apollo",
		features: [EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.APOLLO,
		packageIndicators: {
			dependencies: ["@apollo/client", "apollo-server"],
		},
	},

	// Astro
	[EFramework.ASTRO]: {
		description: "Astro static site generator",
		displayName: "Astro",
		features: [EEslintFeature.TYPESCRIPT, EEslintFeature.TAILWIND_CSS, EEslintFeature.PRETTIER],
		fileIndicators: ["astro.config.mjs", "astro.config.ts"],
		ignorePath: {
			directories: [".astro"],
			patterns: ["public/**/*", "**/*.d.ts"],
		},
		lintPaths: ["src/**/*.astro", "src/**/*.ts", "src/**/*.tsx"],
		name: EFramework.ASTRO,
		packageIndicators: {
			dependencies: ["astro"],
			devDependencies: ["@astrojs/tailwind"],
		},
	},

	[EFramework.BABEL]: {
		description: "Babel compiler configuration",
		displayName: "Babel",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
		fileIndicators: ["babel.config.js", ".babelrc"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: [],
		name: EFramework.BABEL,
		packageIndicators: {
			devDependencies: ["@babel/core"],
		},
	},

	[EFramework.BACKBONE]: {
		description: "Backbone.js framework project",
		displayName: "Backbone.js",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*.js"],
		name: EFramework.BACKBONE,
		packageIndicators: {
			dependencies: ["backbone", "underscore"],
		},
	},

	[EFramework.BLITZ]: {
		description: "Blitz.js full-stack React framework",
		displayName: "Blitz.js",
		features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: ["blitz.config.js", "blitz.config.ts"],
		ignorePath: {
			directories: [".blitz"],
			patterns: [],
		},
		lintPaths: ["app/**/*"],
		name: EFramework.BLITZ,
		packageIndicators: {
			dependencies: ["blitz"],
			either: ["react", "react-dom"],
		},
	},

	[EFramework.BOOTSTRAP]: {
		description: "Bootstrap UI library project",
		displayName: "Bootstrap",
		features: [EEslintFeature.JAVASCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.BOOTSTRAP,
		packageIndicators: {
			dependencies: ["bootstrap"],
		},
	},

	[EFramework.CAPACITOR]: {
		description: "Capacitor mobile application framework",
		displayName: "Capacitor",
		features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT],
		fileIndicators: ["capacitor.config.json", "capacitor.config.ts"],
		ignorePath: {
			directories: ["android", "ios"],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.CAPACITOR,
		packageIndicators: {
			dependencies: ["@capacitor/core"],
		},
	},

	[EFramework.CHAKRA_UI]: {
		description: "Chakra UI React component library",
		displayName: "Chakra UI",
		features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.CHAKRA_UI,
		packageIndicators: {
			dependencies: ["@chakra-ui/react"],
		},
	},

	[EFramework.CYPRESS]: {
		description: "Cypress end-to-end testing framework",
		displayName: "Cypress",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
		fileIndicators: ["cypress.config.js", "cypress.config.ts"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["cypress/**/*.js", "cypress/**/*.ts"],
		name: EFramework.CYPRESS,
		packageIndicators: {
			devDependencies: ["cypress"],
		},
	},

	[EFramework.DIRECTUS]: {
		description: "Directus headless CMS project",
		displayName: "Directus",
		features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT],
		fileIndicators: ["directus.config.js", "directus-extension.json"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["extensions/**/*"],
		name: EFramework.DIRECTUS,
		packageIndicators: {
			dependencies: ["directus"],
		},
	},

	[EFramework.DRIZZLE]: {
		description: "Drizzle ORM for TypeScript",
		displayName: "Drizzle ORM",
		features: [EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.DRIZZLE,
		packageIndicators: {
			dependencies: ["drizzle-orm"],
		},
	},

	// Electron
	[EFramework.ELECTRON]: {
		description: "Electron desktop application framework",
		displayName: "Electron",
		features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: ["electron.config.js", "electron-builder.yml", "electron-builder.json"],
		ignorePath: {
			directories: ["release"],
			patterns: ["build/**/*", "**/*.d.ts"],
		},
		lintPaths: ["src/**/*", "app/**/*", "main/**/*", "renderer/**/*"],
		name: EFramework.ELECTRON,
		packageIndicators: {
			dependencies: ["electron"],
			devDependencies: ["electron-builder"],
		},
	},

	[EFramework.ELEVENTY]: {
		description: "Eleventy static site generator",
		displayName: "Eleventy",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: [".eleventy.js", "eleventy.config.js"],
		ignorePath: {
			directories: ["_site"],
			patterns: [],
		},
		lintPaths: ["src/**/*", "content/**/*"],
		name: EFramework.ELEVENTY,
		packageIndicators: {
			devDependencies: ["@11ty/eleventy"],
		},
	},

	[EFramework.EMBER]: {
		description: "Ember.js framework project",
		displayName: "Ember.js",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: ["ember-cli-build.js", ".ember-cli"],
		ignorePath: {
			directories: ["tmp"],
			patterns: [],
		},
		lintPaths: ["app/**/*", "tests/**/*"],
		name: EFramework.EMBER,
		packageIndicators: {
			dependencies: ["ember-source", "ember-cli"],
		},
	},

	[EFramework.ESBUILD]: {
		description: "esbuild bundler project",
		displayName: "esbuild",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: [],
		name: EFramework.ESBUILD,
		packageIndicators: {
			devDependencies: ["esbuild"],
		},
	},

	[EFramework.ESLINT]: {
		description: "ESLint configuration",
		displayName: "ESLint",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [".eslintrc", ".eslintrc.js", ".eslintrc.json"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: [],
		name: EFramework.ESLINT,
		packageIndicators: {
			devDependencies: ["eslint"],
		},
	},

	[EFramework.EXPO]: {
		description: "Expo framework for React Native apps",
		displayName: "Expo",
		features: [EEslintFeature.REACT, EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: ["app.json", "app.config.js"],
		ignorePath: {
			directories: ["ios", "android"],
			patterns: [],
		},
		lintPaths: ["App.js", "src/**/*"],
		name: EFramework.EXPO,
		packageIndicators: {
			dependencies: ["expo"],
			either: ["react", "react-native"],
		},
	},

	// Express.js
	[EFramework.EXPRESS]: {
		description: "Express.js Node.js framework project",
		displayName: "Express.js",
		features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT, EEslintFeature.PERFECTIONIST, EEslintFeature.SONAR],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: ["public/**/*", "uploads/**/*"],
		},
		isSupportWatch: true,
		lintPaths: ["src/**/*.js", "routes/**/*.js", "controllers/**/*.js", "models/**/*.js"],
		name: EFramework.EXPRESS,
		packageIndicators: {
			dependencies: ["express"],
		},
	},

	// Fastify
	[EFramework.FASTIFY]: {
		description: "Fastify Node.js framework project",
		displayName: "Fastify",
		features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT, EEslintFeature.PERFECTIONIST],
		fileIndicators: ["fastify.config.js", "fastify.config.ts"],
		ignorePath: {
			directories: [],
			patterns: ["test/**/*", "**/*.spec.ts"],
		},
		isSupportWatch: true,
		lintPaths: ["src/**/*.ts", "routes/**/*.ts", "plugins/**/*.ts"],
		name: EFramework.FASTIFY,
		packageIndicators: {
			dependencies: ["fastify"],
		},
	},

	[EFramework.FEATHERS]: {
		description: "Feathers Node.js framework project",
		displayName: "Feathers",
		features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
		fileIndicators: ["feathers-cli.json"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*.js", "src/**/*.ts"],
		name: EFramework.FEATHERS,
		packageIndicators: {
			dependencies: ["@feathersjs/feathers"],
		},
	},

	[EFramework.FLUTTER]: {
		description: "Flutter cross-platform framework (Dart)",
		displayName: "Flutter",
		features: [EEslintFeature.PRETTIER],
		fileIndicators: ["pubspec.yaml"],
		ignorePath: {
			directories: [".dart_tool"],
			patterns: [],
		},
		lintPaths: [],
		name: EFramework.FLUTTER,
		packageIndicators: {
			dependencies: [],
			devDependencies: [],
		},
	},

	[EFramework.FRESH]: {
		description: "Fresh full-stack framework for Deno",
		displayName: "Fresh (Deno)",
		features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: ["fresh.config.ts"],
		ignorePath: {
			directories: [".git", ".vscode"],
			patterns: [],
		},
		lintPaths: ["routes/**/*", "islands/**/*"],
		name: EFramework.FRESH,
		packageIndicators: {},
	},

	// -------------------------------
	// Meta-frameworks
	// -------------------------------
	[EFramework.GATSBY]: {
		description: "Gatsby React-based static site generator",
		displayName: "Gatsby",
		features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: ["gatsby-config.js", "gatsby-config.ts", "gatsby-node.js", "gatsby-node.ts"],
		ignorePath: {
			directories: ["public", ".cache"],
			patterns: ["**/*.d.ts"],
		},
		lintPaths: ["src/**/*", "plugins/**/*"],
		name: EFramework.GATSBY,
		packageIndicators: {
			dependencies: ["gatsby"],
			either: ["react", "react-dom"],
		},
	},

	[EFramework.GRAPHQL]: {
		description: "Generic GraphQL usage (apollo, graphql.js, etc.)",
		displayName: "GraphQL",
		features: [EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.GRAPHQL,
		packageIndicators: {
			dependencies: ["graphql"],
		},
	},

	[EFramework.GRIDSOME]: {
		description: "Gridsome Vue.js static site generator",
		displayName: "Gridsome",
		features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: ["gridsome.config.js", "gridsome.config.ts"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.GRIDSOME,
		packageIndicators: {
			dependencies: ["gridsome", "vue"],
		},
	},

	// -------------------------------
	// Backend frameworks
	// -------------------------------
	[EFramework.HAPI]: {
		description: "hapi Node.js framework project",
		displayName: "hapi",
		features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*.js"],
		name: EFramework.HAPI,
		packageIndicators: {
			dependencies: ["@hapi/hapi"],
		},
	},

	[EFramework.IONIC]: {
		description: "Ionic mobile & desktop framework project",
		displayName: "Ionic",
		features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: ["ionic.config.json"],
		ignorePath: {
			directories: ["www"],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.IONIC,
		packageIndicators: {
			dependencies: ["@ionic/angular"],
			either: ["@ionic/react", "@ionic/vue"],
		},
	},

	[EFramework.JASMINE]: {
		description: "Jasmine testing framework",
		displayName: "Jasmine",
		features: [EEslintFeature.JAVASCRIPT],
		fileIndicators: ["jasmine.json"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["spec/**/*"],
		name: EFramework.JASMINE,
		packageIndicators: {
			devDependencies: ["jasmine"],
		},
	},

	// --------------------
	// Testing frameworks
	// --------------------
	[EFramework.JEST]: {
		description: "Jest testing framework config",
		displayName: "Jest",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
		fileIndicators: ["jest.config.js", "jest.config.ts"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["tests/**/*", "__tests__/**/*"],
		name: EFramework.JEST,
		packageIndicators: {
			devDependencies: ["jest"],
		},
	},

	[EFramework.JOTAI]: {
		description: "Jotai atomic state management for React",
		displayName: "Jotai",
		features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.JOTAI,
		packageIndicators: {
			dependencies: ["jotai"],
		},
	},

	[EFramework.KARMA]: {
		description: "Karma test runner",
		displayName: "Karma",
		features: [EEslintFeature.JAVASCRIPT],
		fileIndicators: ["karma.conf.js"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["test/**/*", "src/**/*"],
		name: EFramework.KARMA,
		packageIndicators: {
			devDependencies: ["karma"],
		},
	},

	[EFramework.KEYSTONE]: {
		description: "Keystone.js headless CMS framework",
		displayName: "Keystone",
		features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT],
		fileIndicators: ["keystone.ts", "keystone.js"],
		ignorePath: {
			directories: [".keystone"],
			patterns: [],
		},
		lintPaths: ["schema/**/*", "routes/**/*"],
		name: EFramework.KEYSTONE,
		packageIndicators: {
			dependencies: ["@keystone-6/core"],
		},
	},

	// Koa
	[EFramework.KOA]: {
		description: "Koa Node.js framework project",
		displayName: "Koa",
		features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT, EEslintFeature.PERFECTIONIST],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: ["public/**/*", "test/**/*"],
		},
		isSupportWatch: true,
		lintPaths: ["src/**/*.js", "routes/**/*.js", "middleware/**/*.js"],
		name: EFramework.KOA,
		packageIndicators: {
			dependencies: ["koa"],
		},
	},

	[EFramework.LESS]: {
		description: "Less CSS preprocessor configuration",
		displayName: "Less",
		features: [],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: [],
		name: EFramework.LESS,
		packageIndicators: {
			devDependencies: ["less"],
		},
	},

	[EFramework.LIT]: {
		description: "Lit library project for web components",
		displayName: "Lit",
		features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*.ts"],
		name: EFramework.LIT,
		packageIndicators: {
			dependencies: ["lit"],
		},
	},

	[EFramework.LOOPBACK]: {
		description: "LoopBack Node.js framework project",
		displayName: "LoopBack",
		features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT],
		fileIndicators: ["loopback.json"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*.ts"],
		name: EFramework.LOOPBACK,
		packageIndicators: {
			dependencies: ["@loopback/core"],
		},
	},

	[EFramework.MARKO]: {
		description: "Marko UI framework project",
		displayName: "Marko",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: ["marko-cli.json"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*.marko", "src/**/*.js"],
		name: EFramework.MARKO,
		packageIndicators: {
			dependencies: ["marko"],
		},
	},

	// -------------------------
	// UI Component Libraries
	// -------------------------
	[EFramework.MATERIAL_UI]: {
		description: "Material-UI React UI library project",
		displayName: "Material-UI (MUI)",
		features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.MATERIAL_UI,
		packageIndicators: {
			dependencies: ["@mui/material", "@mui/core", "@emotion/react"],
		},
	},

	[EFramework.MEDUSA]: {
		description: "Medusa JS eCommerce backend framework",
		displayName: "Medusa",
		features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT],
		fileIndicators: ["medusa-config.js", "medusa-config.ts"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.MEDUSA,
		packageIndicators: {
			dependencies: ["@medusajs/medusa"],
		},
	},

	[EFramework.METEOR]: {
		description: "Meteor full-stack JS framework project",
		displayName: "Meteor",
		features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT],
		fileIndicators: [".meteor/release"],
		ignorePath: {
			directories: ["public"],
			patterns: [],
		},
		lintPaths: ["client/**/*", "server/**/*", "imports/**/*"],
		name: EFramework.METEOR,
		packageIndicators: {
			dependencies: ["meteor-node-stubs"],
		},
	},

	[EFramework.MITHRIL]: {
		description: "Mithril.js framework project",
		displayName: "Mithril.js",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*.js"],
		name: EFramework.MITHRIL,
		packageIndicators: {
			dependencies: ["mithril"],
		},
	},

	[EFramework.MOBX]: {
		description: "MobX state management for JavaScript/React",
		displayName: "MobX",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.MOBX,
		packageIndicators: {
			dependencies: ["mobx"],
		},
	},

	[EFramework.MOCHA]: {
		description: "Mocha testing framework",
		displayName: "Mocha",
		features: [EEslintFeature.JAVASCRIPT],
		fileIndicators: [".mocharc.js", ".mocharc.json"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["test/**/*"],
		name: EFramework.MOCHA,
		packageIndicators: {
			devDependencies: ["mocha"],
		},
	},

	[EFramework.MONGOOSE]: {
		description: "Mongoose ODM for MongoDB",
		displayName: "Mongoose",
		features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["models/**/*"],
		name: EFramework.MONGOOSE,
		packageIndicators: {
			dependencies: ["mongoose"],
		},
	},

	[EFramework.NATIVESCRIPT]: {
		description: "NativeScript cross-platform framework",
		displayName: "NativeScript",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: ["nativescript.config.ts", "nativescript.config.js"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["app/**/*"],
		name: EFramework.NATIVESCRIPT,
		packageIndicators: {
			dependencies: ["nativescript"],
		},
	},

	// NestJS
	[EFramework.NEST]: {
		description: "NestJS framework project",
		displayName: "NestJS",
		features: [EEslintFeature.NEST, EEslintFeature.TYPESCRIPT, EEslintFeature.PERFECTIONIST, EEslintFeature.SONAR],
		fileIndicators: ["nest-cli.json", ".nest-cli.json"],
		ignorePath: {
			directories: [],
			patterns: ["**/*.spec.ts", "**/*.e2e-spec.ts"],
		},
		isSupportWatch: true,
		lintPaths: ["src/**/*.ts", "test/**/*.ts", "libs/**/*.ts"],
		name: EFramework.NEST,
		packageIndicators: {
			dependencies: ["@nestjs/core", "@nestjs/common"],
			devDependencies: ["@nestjs/cli"],
		},
	},

	// Next.js
	[EFramework.NEXT]: {
		description: "Next.js React framework project",
		displayName: "Next.js",
		features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT, EEslintFeature.TAILWIND_CSS, EEslintFeature.PRETTIER],
		fileIndicators: ["next.config.js", "next.config.mjs", "next.config.ts"],
		ignorePath: {
			directories: [".next"],
			patterns: ["**/*.d.ts", "public/**/*"],
		},
		isSupportWatch: true,
		lintPaths: ["pages/**/*", "app/**/*", "components/**/*", "lib/**/*"],
		name: EFramework.NEXT,
		packageIndicators: {
			dependencies: ["next"],
			either: ["react", "react-dom"],
		},
	},

	[EFramework.NIGHTWATCH]: {
		description: "Nightwatch.js end-to-end testing framework",
		displayName: "Nightwatch",
		features: [EEslintFeature.JAVASCRIPT],
		fileIndicators: ["nightwatch.conf.js"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["tests/**/*"],
		name: EFramework.NIGHTWATCH,
		packageIndicators: {
			devDependencies: ["nightwatch"],
		},
	},

	// Generic project
	[EFramework.NONE]: {
		description: "No specific framework detected",
		displayName: "Generic Project",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
		ignorePath: {
			directories: [],
			patterns: ["**/*.min.js", "**/*.bundle.js"],
		},
		lintPaths: ["src/**/*", "lib/**/*"],
		name: EFramework.NONE,
		packageIndicators: {},
	},

	// Nuxt.js
	[EFramework.NUXT]: {
		description: "Nuxt.js Vue framework project",
		displayName: "Nuxt.js",
		features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER, EEslintFeature.TAILWIND_CSS],
		fileIndicators: ["nuxt.config.js", "nuxt.config.ts"],
		ignorePath: {
			directories: [".nuxt"],
			patterns: ["static/**/*", "assets/**/*"],
		},
		lintPaths: ["pages/**/*.vue", "components/**/*.vue", "layouts/**/*.vue"],
		name: EFramework.NUXT,
		packageIndicators: {
			dependencies: ["nuxt"],
			devDependencies: ["@nuxt/types"],
		},
	},

	[EFramework.PARCEL]: {
		description: "Parcel bundler project",
		displayName: "Parcel",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: [],
		name: EFramework.PARCEL,
		packageIndicators: {
			devDependencies: ["parcel"],
		},
	},

	[EFramework.PINIA]: {
		description: "Pinia state management for Vue",
		displayName: "Pinia",
		features: [EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.PINIA,
		packageIndicators: {
			dependencies: ["pinia"],
		},
	},

	[EFramework.PLAYWRIGHT]: {
		description: "Playwright end-to-end testing framework",
		displayName: "Playwright",
		features: [EEslintFeature.TYPESCRIPT, EEslintFeature.JAVASCRIPT],
		fileIndicators: ["playwright.config.js", "playwright.config.ts"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["tests/**/*"],
		name: EFramework.PLAYWRIGHT,
		packageIndicators: {
			devDependencies: ["@playwright/test"],
		},
	},

	[EFramework.POLYMER]: {
		description: "Polymer library project",
		displayName: "Polymer",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: ["polymer.json"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*.js"],
		name: EFramework.POLYMER,
		packageIndicators: {
			dependencies: ["@polymer/polymer"],
		},
	},

	[EFramework.POSTCSS]: {
		description: "PostCSS configuration project",
		displayName: "PostCSS",
		features: [],
		fileIndicators: ["postcss.config.js"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: [],
		name: EFramework.POSTCSS,
		packageIndicators: {
			devDependencies: ["postcss"],
		},
	},

	[EFramework.PREACT]: {
		description: "Preact lightweight React alternative",
		displayName: "Preact",
		features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: ["preact.config.js"],
		ignorePath: {
			directories: [],
			patterns: ["**/*.d.ts"],
		},
		lintPaths: ["src/**/*.jsx", "src/**/*.tsx"],
		name: EFramework.PREACT,
		packageIndicators: {
			dependencies: ["preact"],
		},
	},

	// --------------------
	// Development Tools
	// --------------------
	[EFramework.PRETTIER]: {
		description: "Prettier code formatter configuration",
		displayName: "Prettier",
		features: [EEslintFeature.PRETTIER],
		fileIndicators: [".prettierrc", ".prettierrc.js", "prettier.config.js"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: [],
		name: EFramework.PRETTIER,
		packageIndicators: {
			devDependencies: ["prettier"],
		},
	},

	// ----------------
	// Server Side
	// ----------------
	[EFramework.PRISMA]: {
		description: "Prisma ORM configuration",
		displayName: "Prisma",
		features: [EEslintFeature.TYPESCRIPT],
		fileIndicators: ["prisma/schema.prisma"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: [],
		name: EFramework.PRISMA,
		packageIndicators: {
			dependencies: ["@prisma/client"],
			devDependencies: ["prisma"],
		},
	},

	[EFramework.PUPPETEER]: {
		description: "Puppeteer testing / automation tool",
		displayName: "Puppeteer",
		features: [EEslintFeature.JAVASCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["tests/**/*"],
		name: EFramework.PUPPETEER,
		packageIndicators: {
			devDependencies: ["puppeteer"],
		},
	},

	[EFramework.QWIK]: {
		description: "Qwik resumable frontend framework project",
		displayName: "Qwik",
		features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: ["qwik.config.ts"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.QWIK,
		packageIndicators: {
			dependencies: ["@builder.io/qwik"],
		},
	},

	// React
	[EFramework.REACT]: {
		description: "React library project",
		displayName: "React",
		features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT, EEslintFeature.TAILWIND_CSS, EEslintFeature.PRETTIER],
		fileIndicators: ["src/App.jsx", "src/App.tsx"],
		ignorePath: {
			directories: [],
			patterns: ["**/*.d.ts", "public/**/*"],
		},
		lintPaths: ["src/**/*", "components/**/*"],
		name: EFramework.REACT,
		packageIndicators: {
			dependencies: ["react", "react-dom"],
		},
	},

	[EFramework.REACT_NATIVE]: {
		description: "React Native mobile application project",
		displayName: "React Native",
		features: [EEslintFeature.REACT, EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: [],
		ignorePath: {
			directories: ["android", "ios"],
			patterns: [],
		},
		lintPaths: ["App.js", "src/**/*"],
		name: EFramework.REACT_NATIVE,
		packageIndicators: {
			dependencies: ["react-native"],
			either: ["react"],
		},
	},

	[EFramework.RECOIL]: {
		description: "Recoil state management for React",
		displayName: "Recoil",
		features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.RECOIL,
		packageIndicators: {
			dependencies: ["recoil"],
		},
	},

	// ------------------
	// State Management
	// ------------------
	[EFramework.REDUX]: {
		description: "Redux state management for React",
		displayName: "Redux",
		features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.REDUX,
		packageIndicators: {
			dependencies: ["redux"],
			either: ["react-redux"],
		},
	},

	// --------------------
	// Full-stack frameworks
	// --------------------
	[EFramework.REDWOOD]: {
		description: "RedwoodJS full-stack framework project",
		displayName: "RedwoodJS",
		features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: ["redwood.toml"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["api/src/**/*", "web/src/**/*"],
		name: EFramework.REDWOOD,
		packageIndicators: {
			dependencies: ["@redwoodjs/core"],
		},
	},

	[EFramework.RELAY]: {
		description: "Relay GraphQL client for React",
		displayName: "Relay",
		features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.RELAY,
		packageIndicators: {
			dependencies: ["react-relay", "relay-runtime"],
		},
	},

	// Remix
	[EFramework.REMIX]: {
		description: "Remix React framework project",
		displayName: "Remix",
		features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT, EEslintFeature.TAILWIND_CSS],
		fileIndicators: ["remix.config.js", "remix.config.ts", "app/root.tsx"],
		ignorePath: {
			directories: ["public/build"],
			patterns: ["public/**/*", "**/*.d.ts"],
		},
		lintPaths: ["app/**/*", "routes/**/*", "styles/**/*"],
		name: EFramework.REMIX,
		packageIndicators: {
			dependencies: ["@remix-run/react", "@remix-run/node"],
		},
	},

	[EFramework.RESTIFY]: {
		description: "Restify Node.js framework project",
		displayName: "Restify",
		features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*.js"],
		name: EFramework.RESTIFY,
		packageIndicators: {
			dependencies: ["restify"],
		},
	},

	[EFramework.ROLLUP]: {
		description: "Rollup bundler project",
		displayName: "Rollup",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
		fileIndicators: ["rollup.config.js", "rollup.config.ts"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: [],
		name: EFramework.ROLLUP,
		packageIndicators: {
			devDependencies: ["rollup"],
		},
	},

	[EFramework.SAILS]: {
		description: "Sails.js MVC Node.js framework project",
		displayName: "Sails.js",
		features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT],
		fileIndicators: ["sails.config.js"],
		ignorePath: {
			directories: ["views"],
			patterns: [],
		},
		lintPaths: ["api/**/*.js", "config/**/*.js"],
		name: EFramework.SAILS,
		packageIndicators: {
			dependencies: ["sails"],
		},
	},

	[EFramework.SASS]: {
		description: "Sass/SCSS preprocessor configuration",
		displayName: "Sass/SCSS",
		features: [],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: [],
		name: EFramework.SASS,
		packageIndicators: {
			devDependencies: ["sass"],
		},
	},

	[EFramework.SEQUELIZE]: {
		description: "Sequelize ORM configuration",
		displayName: "Sequelize",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
		fileIndicators: ["sequelize.config.js", ".sequelizerc"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["models/**/*", "migrations/**/*"],
		name: EFramework.SEQUELIZE,
		packageIndicators: {
			dependencies: ["sequelize"],
		},
	},

	[EFramework.SNOWPACK]: {
		description: "Snowpack build tool project",
		displayName: "Snowpack",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
		fileIndicators: ["snowpack.config.js", "snowpack.config.ts"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: [],
		name: EFramework.SNOWPACK,
		packageIndicators: {
			devDependencies: ["snowpack"],
		},
	},

	// -----------------------------
	// Frontend frameworks/libraries
	// -----------------------------
	[EFramework.SOLID]: {
		description: "Solid.js frontend library project",
		displayName: "Solid.js",
		features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*.tsx", "components/**/*.tsx"],
		name: EFramework.SOLID,
		packageIndicators: {
			dependencies: ["solid-js"],
		},
	},

	[EFramework.STORYBOOK]: {
		description: "Storybook UI component explorer",
		displayName: "Storybook",
		features: [EEslintFeature.REACT, EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [".storybook/main.js", ".storybook/main.ts"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["stories/**/*"],
		name: EFramework.STORYBOOK,
		packageIndicators: {
			devDependencies: ["@storybook/react", "@storybook/vue", "@storybook/svelte"],
		},
	},

	[EFramework.STRAPI]: {
		description: "Strapi Headless CMS framework project",
		displayName: "Strapi",
		features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*", "config/**/*"],
		name: EFramework.STRAPI,
		packageIndicators: {
			dependencies: ["strapi"],
		},
	},

	[EFramework.STYLED_COMPONENTS]: {
		description: "Styled Components for React",
		displayName: "Styled Components",
		features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.STYLED_COMPONENTS,
		packageIndicators: {
			dependencies: ["styled-components"],
		},
	},

	// Svelte
	[EFramework.SVELTE]: {
		description: "Svelte framework project",
		displayName: "Svelte",
		features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER, EEslintFeature.TAILWIND_CSS],
		fileIndicators: ["svelte.config.js"],
		ignorePath: {
			directories: [".svelte-kit"],
			patterns: ["static/**/*", "**/*.d.ts"],
		},
		lintPaths: ["src/**/*.svelte", "src/**/*.ts", "src/**/*.js"],
		name: EFramework.SVELTE,
		packageIndicators: {
			dependencies: ["svelte"],
			devDependencies: ["@sveltejs/kit"],
		},
	},

	[EFramework.SVELTEKIT]: {
		description: "SvelteKit meta-framework project",
		displayName: "SvelteKit",
		features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER, EEslintFeature.TAILWIND_CSS],
		fileIndicators: ["svelte.config.js", "svelte.config.ts"],
		ignorePath: {
			directories: [".svelte-kit"],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.SVELTEKIT,
		packageIndicators: {
			dependencies: ["@sveltejs/kit", "svelte"],
		},
	},

	[EFramework.SWR]: {
		description: "SWR React hooks library for data fetching",
		displayName: "SWR",
		features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.SWR,
		packageIndicators: {
			dependencies: ["swr"],
		},
	},

	[EFramework.TAILWIND]: {
		description: "Tailwind CSS setup project",
		displayName: "Tailwind CSS",
		features: [EEslintFeature.TAILWIND_CSS],
		fileIndicators: ["tailwind.config.js", "tailwind.config.ts"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: [],
		name: EFramework.TAILWIND,
		packageIndicators: {
			devDependencies: ["tailwindcss"],
		},
	},

	[EFramework.TANSTACK_QUERY]: {
		description: "TanStack React Query for data fetching",
		displayName: "TanStack Query (React Query)",
		features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.TANSTACK_QUERY,
		packageIndicators: {
			dependencies: ["@tanstack/react-query"],
		},
	},

	// --------------------
	// Desktop / Mobile
	// --------------------
	[EFramework.TAURI]: {
		description: "Tauri desktop application framework",
		displayName: "Tauri",
		features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT],
		fileIndicators: ["tauri.conf.json"],
		ignorePath: {
			directories: ["src-tauri"],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.TAURI,
		packageIndicators: {
			dependencies: ["@tauri-apps/api"],
		},
	},

	[EFramework.TRPC]: {
		description: "tRPC end-to-end typesafe API",
		displayName: "tRPC",
		features: [EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.TRPC,
		packageIndicators: {
			dependencies: ["@trpc/server", "@trpc/client"],
		},
	},

	[EFramework.TURBOPACK]: {
		description: "Turbopack (experimental bundler by Vercel)",
		displayName: "Turbopack",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: [],
		name: EFramework.TURBOPACK,
		packageIndicators: {
			devDependencies: ["@vercel/turbopack"],
		},
	},

	[EFramework.TYPEORM]: {
		description: "TypeORM configuration",
		displayName: "TypeORM",
		features: [EEslintFeature.TYPEORM, EEslintFeature.TYPESCRIPT],
		fileIndicators: ["ormconfig.json", "ormconfig.js", "ormconfig.ts"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.TYPEORM,
		packageIndicators: {
			dependencies: ["typeorm"],
		},
	},

	[EFramework.TYPESCRIPT]: {
		description: "TypeScript configuration project",
		displayName: "TypeScript",
		features: [EEslintFeature.TYPESCRIPT],
		fileIndicators: ["tsconfig.json"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: [],
		name: EFramework.TYPESCRIPT,
		packageIndicators: {
			devDependencies: ["typescript"],
		},
	},

	[EFramework.VITE]: {
		description: "Vite frontend build tool / dev server project",
		displayName: "Vite",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
		fileIndicators: ["vite.config.js", "vite.config.ts"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*", "public/**/*"],
		name: EFramework.VITE,
		packageIndicators: {
			devDependencies: ["vite"],
		},
	},

	[EFramework.VITEST]: {
		description: "Vitest testing framework for Vite",
		displayName: "Vitest",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
		fileIndicators: ["vitest.config.js", "vitest.config.ts"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["test/**/*", "src/**/*"],
		name: EFramework.VITEST,
		packageIndicators: {
			devDependencies: ["vitest"],
		},
	},

	// Vue.js
	[EFramework.VUE]: {
		description: "Vue.js framework project",
		displayName: "Vue.js",
		features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER, EEslintFeature.TAILWIND_CSS],
		fileIndicators: ["vue.config.js", ".vuerc"],
		ignorePath: {
			directories: [],
			patterns: ["public/**/*", "**/*.d.ts"],
		},
		lintPaths: ["src/**/*.vue", "src/**/*.ts", "src/**/*.js"],
		name: EFramework.VUE,
		packageIndicators: {
			dependencies: ["vue"],
			devDependencies: ["@vue/cli-service"],
		},
	},

	[EFramework.WEBDRIVERIO]: {
		description: "WebdriverIO end-to-end testing framework",
		displayName: "WebdriverIO",
		features: [EEslintFeature.JAVASCRIPT],
		fileIndicators: ["wdio.conf.js"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["tests/**/*"],
		name: EFramework.WEBDRIVERIO,
		packageIndicators: {
			devDependencies: ["webdriverio"],
		},
	},

	// ------------------
	// Build Tools
	// ------------------
	[EFramework.WEBPACK]: {
		description: "Webpack bundler project",
		displayName: "Webpack",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
		fileIndicators: ["webpack.config.js", "webpack.config.ts"],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: [],
		name: EFramework.WEBPACK,
		packageIndicators: {
			devDependencies: ["webpack", "webpack-cli"],
		},
	},

	[EFramework.XSTATE]: {
		description: "XState state machines for JS/TS",
		displayName: "XState",
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.XSTATE,
		packageIndicators: {
			dependencies: ["xstate"],
		},
	},

	[EFramework.ZUSTAND]: {
		description: "Zustand state management for React",
		displayName: "Zustand",
		features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
		fileIndicators: [],
		ignorePath: {
			directories: [],
			patterns: [],
		},
		lintPaths: ["src/**/*"],
		name: EFramework.ZUSTAND,
		packageIndicators: {
			dependencies: ["zustand"],
		},
	},
};
