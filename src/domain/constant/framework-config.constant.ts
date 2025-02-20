import { EFramework } from "../enum/framework.enum";
import { IFrameworkConfig } from "../interface/framework-config.interface";
import { EEslintFeature } from "../enum/eslint-feature.enum";

export const FRAMEWORK_CONFIG: Record<EFramework, IFrameworkConfig> = {
  // Angular
  [EFramework.ANGULAR]: {
    name: EFramework.ANGULAR,
    displayName: "Angular",
    description: "Angular framework project",
    fileIndicators: ["angular.json", ".angular-cli.json", "angular-cli.json"],
    packageIndicators: {
      dependencies: ["@angular/core"],
      devDependencies: ["@angular-devkit/build-angular"],
    },
    lintPaths: ["src/**/*.ts", "src/**/*.html", "src/**/*.scss"],
    ignorePath: {
      directories: [".angular"],
      patterns: ["src/assets/**/*", "src/environments/**/*", "*.spec.ts"],
    },
    features: [
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.PRETTIER,
      EEslintFeature.SONAR,
      EEslintFeature.STYLISTIC,
    ],
  },

  // Next.js
  [EFramework.NEXT]: {
    name: EFramework.NEXT,
    displayName: "Next.js",
    description: "Next.js React framework project",
    fileIndicators: ["next.config.js", "next.config.mjs", "next.config.ts"],
    packageIndicators: {
      dependencies: ["next"],
      either: ["react", "react-dom"],
    },
    isSupportWatch: true,
    lintPaths: ["pages/**/*", "app/**/*", "components/**/*", "lib/**/*"],
    ignorePath: {
      directories: [".next"],
      patterns: ["**/*.d.ts", "public/**/*"],
    },
    features: [
      EEslintFeature.REACT,
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.TAILWIND_CSS,
      EEslintFeature.PRETTIER,
    ],
  },

  // NestJS
  [EFramework.NEST]: {
    name: EFramework.NEST,
    displayName: "NestJS",
    description: "NestJS framework project",
    fileIndicators: ["nest-cli.json", ".nest-cli.json"],
    isSupportWatch: true,
    packageIndicators: {
      dependencies: ["@nestjs/core", "@nestjs/common"],
      devDependencies: ["@nestjs/cli"],
    },
    lintPaths: ["src/**/*.ts", "test/**/*.ts", "libs/**/*.ts"],
    ignorePath: {
      directories: [],
      patterns: ["**/*.spec.ts", "**/*.e2e-spec.ts"],
    },
    features: [
      EEslintFeature.NEST,
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.PERFECTIONIST,
      EEslintFeature.SONAR,
    ],
  },

  // React
  [EFramework.REACT]: {
    name: EFramework.REACT,
    displayName: "React",
    description: "React library project",
    fileIndicators: ["src/App.jsx", "src/App.tsx"], // удалены файлы vite.config.*
    packageIndicators: {
      dependencies: ["react", "react-dom"],
    },
    lintPaths: ["src/**/*", "components/**/*"],
    ignorePath: {
      directories: [],
      patterns: ["**/*.d.ts", "public/**/*"],
    },
    features: [
      EEslintFeature.REACT,
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.TAILWIND_CSS,
      EEslintFeature.PRETTIER,
    ],
  },

  // Vue.js
  [EFramework.VUE]: {
    name: EFramework.VUE,
    displayName: "Vue.js",
    description: "Vue.js framework project",
    fileIndicators: ["vue.config.js", ".vuerc"], // удалён vite.config.ts
    packageIndicators: {
      dependencies: ["vue"],
      devDependencies: ["@vue/cli-service"],
    },
    lintPaths: ["src/**/*.vue", "src/**/*.ts", "src/**/*.js"],
    ignorePath: {
      directories: [],
      patterns: ["public/**/*", "**/*.d.ts"],
    },
    features: [
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.PRETTIER,
      EEslintFeature.TAILWIND_CSS,
    ],
  },

  // Express.js
  [EFramework.EXPRESS]: {
    name: EFramework.EXPRESS,
    displayName: "Express.js",
    description: "Express.js Node.js framework project",
    isSupportWatch: true,
    fileIndicators: [], // удалены общие файлы типа app.js, server.js, index.js
    packageIndicators: {
      dependencies: ["express"],
    },
    lintPaths: [
      "src/**/*.js",
      "routes/**/*.js",
      "controllers/**/*.js",
      "models/**/*.js",
    ],
    ignorePath: {
      directories: [],
      patterns: ["public/**/*", "uploads/**/*"],
    },
    features: [
      EEslintFeature.NODE,
      EEslintFeature.JAVASCRIPT,
      EEslintFeature.PERFECTIONIST,
      EEslintFeature.SONAR,
    ],
  },

  // Fastify
  [EFramework.FASTIFY]: {
    name: EFramework.FASTIFY,
    displayName: "Fastify",
    description: "Fastify Node.js framework project",
    fileIndicators: ["fastify.config.js", "fastify.config.ts"],
    isSupportWatch: true,
    packageIndicators: {
      dependencies: ["fastify"],
    },
    lintPaths: ["src/**/*.ts", "routes/**/*.ts", "plugins/**/*.ts"],
    ignorePath: {
      directories: [],
      patterns: ["test/**/*", "**/*.spec.ts"],
    },
    features: [
      EEslintFeature.NODE,
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.PERFECTIONIST,
    ],
  },

  // Koa
  [EFramework.KOA]: {
    name: EFramework.KOA,
    displayName: "Koa",
    description: "Koa Node.js framework project",
    fileIndicators: [], // удалены общие app.js, server.js, index.js
    isSupportWatch: true,
    packageIndicators: {
      dependencies: ["koa"],
    },
    lintPaths: ["src/**/*.js", "routes/**/*.js", "middleware/**/*.js"],
    ignorePath: {
      directories: [],
      patterns: ["public/**/*", "test/**/*"],
    },
    features: [
      EEslintFeature.NODE,
      EEslintFeature.JAVASCRIPT,
      EEslintFeature.PERFECTIONIST,
    ],
  },

  // Remix
  [EFramework.REMIX]: {
    name: EFramework.REMIX,
    displayName: "Remix",
    description: "Remix React framework project",
    fileIndicators: ["remix.config.js", "remix.config.ts", "app/root.tsx"],
    packageIndicators: {
      dependencies: ["@remix-run/react", "@remix-run/node"],
    },
    lintPaths: ["app/**/*", "routes/**/*", "styles/**/*"],
    ignorePath: {
      directories: ["public/build"],
      patterns: ["public/**/*", "**/*.d.ts"],
    },
    features: [
      EEslintFeature.REACT,
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.TAILWIND_CSS,
    ],
  },

  // Nuxt.js
  [EFramework.NUXT]: {
    name: EFramework.NUXT,
    displayName: "Nuxt.js",
    description: "Nuxt.js Vue framework project",
    fileIndicators: ["nuxt.config.js", "nuxt.config.ts"],
    packageIndicators: {
      dependencies: ["nuxt"],
      devDependencies: ["@nuxt/types"],
    },
    lintPaths: ["pages/**/*.vue", "components/**/*.vue", "layouts/**/*.vue"],
    ignorePath: {
      directories: [".nuxt"],
      patterns: ["static/**/*", "assets/**/*"],
    },
    features: [
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.PRETTIER,
      EEslintFeature.TAILWIND_CSS,
    ],
  },

  // Svelte
  [EFramework.SVELTE]: {
    name: EFramework.SVELTE,
    displayName: "Svelte",
    description: "Svelte framework project",
    fileIndicators: ["svelte.config.js"], // оставляем только svelte.config.js
    packageIndicators: {
      dependencies: ["svelte"],
      devDependencies: ["@sveltejs/kit"],
    },
    lintPaths: ["src/**/*.svelte", "src/**/*.ts", "src/**/*.js"],
    ignorePath: {
      directories: [".svelte-kit"],
      patterns: ["static/**/*", "**/*.d.ts"],
    },
    features: [
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.PRETTIER,
      EEslintFeature.TAILWIND_CSS,
    ],
  },

  // Astro
  [EFramework.ASTRO]: {
    name: EFramework.ASTRO,
    displayName: "Astro",
    description: "Astro static site generator",
    fileIndicators: ["astro.config.mjs", "astro.config.ts"],
    packageIndicators: {
      dependencies: ["astro"],
      devDependencies: ["@astrojs/tailwind"],
    },
    lintPaths: ["src/**/*.astro", "src/**/*.ts", "src/**/*.tsx"],
    ignorePath: {
      directories: [".astro"],
      patterns: ["public/**/*", "**/*.d.ts"],
    },
    features: [
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.TAILWIND_CSS,
      EEslintFeature.PRETTIER,
    ],
  },

  // Electron
  [EFramework.ELECTRON]: {
    name: EFramework.ELECTRON,
    displayName: "Electron",
    description: "Electron desktop application framework",
    fileIndicators: [
      "electron.config.js",
      "electron-builder.yml",
      "electron-builder.json",
    ],
    packageIndicators: {
      dependencies: ["electron"],
      devDependencies: ["electron-builder"],
    },
    lintPaths: ["src/**/*", "app/**/*", "main/**/*", "renderer/**/*"],
    ignorePath: {
      directories: ["release"],
      patterns: ["build/**/*", "**/*.d.ts"],
    },
    features: [
      EEslintFeature.NODE,
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.PRETTIER,
    ],
  },

  // Generic project
  [EFramework.NONE]: {
    name: EFramework.NONE,
    displayName: "Generic Project",
    description: "No specific framework detected",
    packageIndicators: {},
    lintPaths: ["src/**/*", "lib/**/*"],
    ignorePath: {
      directories: [],
      patterns: ["**/*.min.js", "**/*.bundle.js"],
    },
    features: [
      EEslintFeature.JAVASCRIPT,
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.PRETTIER,
    ],
  },

  // -----------------------------
  // Frontend frameworks/libraries
  // -----------------------------
  [EFramework.SOLID]: {
    name: EFramework.SOLID,
    displayName: "Solid.js",
    description: "Solid.js frontend library project",
    fileIndicators: [], // удалены неоднозначные файлы
    packageIndicators: {
      dependencies: ["solid-js"],
    },
    lintPaths: ["src/**/*.tsx", "components/**/*.tsx"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
  },

  [EFramework.QWIK]: {
    name: EFramework.QWIK,
    displayName: "Qwik",
    description: "Qwik resumable frontend framework project",
    fileIndicators: ["qwik.config.ts"], // оставляем только qwik.config.ts
    packageIndicators: {
      dependencies: ["@builder.io/qwik"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
  },

  [EFramework.PREACT]: {
    name: EFramework.PREACT,
    displayName: "Preact",
    description: "Preact lightweight React alternative",
    fileIndicators: ["preact.config.js"], // оставляем только preact.config.js
    packageIndicators: {
      dependencies: ["preact"],
    },
    lintPaths: ["src/**/*.jsx", "src/**/*.tsx"],
    ignorePath: {
      directories: [],
      patterns: ["**/*.d.ts"],
    },
    features: [
      EEslintFeature.REACT,
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.PRETTIER,
    ],
  },

  [EFramework.POLYMER]: {
    name: EFramework.POLYMER,
    displayName: "Polymer",
    description: "Polymer library project",
    fileIndicators: ["polymer.json"],
    packageIndicators: {
      dependencies: ["@polymer/polymer"],
    },
    lintPaths: ["src/**/*.js"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
  },

  [EFramework.LIT]: {
    name: EFramework.LIT,
    displayName: "Lit",
    description: "Lit library project for web components",
    fileIndicators: [], // убраны неоднозначные конфиги
    packageIndicators: {
      dependencies: ["lit"],
    },
    lintPaths: ["src/**/*.ts"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
  },

  [EFramework.ALPINE]: {
    name: EFramework.ALPINE,
    displayName: "Alpine.js",
    description: "Alpine.js lightweight frontend framework",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["alpinejs"],
    },
    lintPaths: ["src/**/*.js", "public/**/*.js"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
  },

  [EFramework.EMBER]: {
    name: EFramework.EMBER,
    displayName: "Ember.js",
    description: "Ember.js framework project",
    fileIndicators: ["ember-cli-build.js", ".ember-cli"],
    packageIndicators: {
      dependencies: ["ember-source", "ember-cli"],
    },
    lintPaths: ["app/**/*", "tests/**/*"],
    ignorePath: {
      directories: ["tmp"],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
  },

  [EFramework.BACKBONE]: {
    name: EFramework.BACKBONE,
    displayName: "Backbone.js",
    description: "Backbone.js framework project",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["backbone", "underscore"],
    },
    lintPaths: ["src/**/*.js"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
  },

  [EFramework.MITHRIL]: {
    name: EFramework.MITHRIL,
    displayName: "Mithril.js",
    description: "Mithril.js framework project",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["mithril"],
    },
    lintPaths: ["src/**/*.js"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
  },

  [EFramework.MARKO]: {
    name: EFramework.MARKO,
    displayName: "Marko",
    description: "Marko UI framework project",
    fileIndicators: ["marko-cli.json"],
    packageIndicators: {
      dependencies: ["marko"],
    },
    lintPaths: ["src/**/*.marko", "src/**/*.js"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
  },

  // -------------------------------
  // Meta-frameworks
  // -------------------------------
  [EFramework.GATSBY]: {
    name: EFramework.GATSBY,
    displayName: "Gatsby",
    description: "Gatsby React-based static site generator",
    fileIndicators: [
      "gatsby-config.js",
      "gatsby-config.ts",
      "gatsby-node.js",
      "gatsby-node.ts",
    ],
    packageIndicators: {
      dependencies: ["gatsby"],
      either: ["react", "react-dom"],
    },
    lintPaths: ["src/**/*", "plugins/**/*"],
    ignorePath: {
      directories: ["public", ".cache"],
      patterns: ["**/*.d.ts"],
    },
    features: [
      EEslintFeature.REACT,
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.PRETTIER,
    ],
  },

  [EFramework.VITE]: {
    name: EFramework.VITE,
    displayName: "Vite",
    description: "Vite frontend build tool / dev server project",
    fileIndicators: ["vite.config.js", "vite.config.ts"],
    packageIndicators: {
      devDependencies: ["vite"],
    },
    lintPaths: ["src/**/*", "public/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [
      EEslintFeature.JAVASCRIPT,
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.PRETTIER,
    ],
  },

  [EFramework.GRIDSOME]: {
    name: EFramework.GRIDSOME,
    displayName: "Gridsome",
    description: "Gridsome Vue.js static site generator",
    fileIndicators: ["gridsome.config.js", "gridsome.config.ts"],
    packageIndicators: {
      dependencies: ["gridsome", "vue"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
  },

  [EFramework.ELEVENTY]: {
    name: EFramework.ELEVENTY,
    displayName: "Eleventy",
    description: "Eleventy static site generator",
    fileIndicators: [".eleventy.js", "eleventy.config.js"],
    packageIndicators: {
      devDependencies: ["@11ty/eleventy"],
    },
    lintPaths: ["src/**/*", "content/**/*"],
    ignorePath: {
      directories: ["_site"],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
  },

  [EFramework.SVELTEKIT]: {
    name: EFramework.SVELTEKIT,
    displayName: "SvelteKit",
    description: "SvelteKit meta-framework project",
    fileIndicators: ["svelte.config.js", "svelte.config.ts"],
    packageIndicators: {
      dependencies: ["@sveltejs/kit", "svelte"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [".svelte-kit"],
      patterns: [],
    },
    features: [
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.PRETTIER,
      EEslintFeature.TAILWIND_CSS,
    ],
  },

  // -------------------------------
  // Backend frameworks
  // -------------------------------
  [EFramework.HAPI]: {
    name: EFramework.HAPI,
    displayName: "hapi",
    description: "hapi Node.js framework project",
    fileIndicators: [], // удалены общие файлы
    packageIndicators: {
      dependencies: ["@hapi/hapi"],
    },
    lintPaths: ["src/**/*.js"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT],
  },

  [EFramework.ADONIS]: {
    name: EFramework.ADONIS,
    displayName: "AdonisJS",
    description: "AdonisJS Node.js framework project",
    fileIndicators: [".adonisrc.json"], // оставлен только уникальный конфиг
    packageIndicators: {
      dependencies: ["@adonisjs/core"],
    },
    lintPaths: ["app/**/*.ts", "start/**/*.ts"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.METEOR]: {
    name: EFramework.METEOR,
    displayName: "Meteor",
    description: "Meteor full-stack JS framework project",
    fileIndicators: [".meteor/release"],
    packageIndicators: {
      dependencies: ["meteor-node-stubs"],
    },
    lintPaths: ["client/**/*", "server/**/*", "imports/**/*"],
    ignorePath: {
      directories: ["public"],
      patterns: [],
    },
    features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT],
  },

  [EFramework.SAILS]: {
    name: EFramework.SAILS,
    displayName: "Sails.js",
    description: "Sails.js MVC Node.js framework project",
    fileIndicators: ["sails.config.js"], // удалён общий app.js
    packageIndicators: {
      dependencies: ["sails"],
    },
    lintPaths: ["api/**/*.js", "config/**/*.js"],
    ignorePath: {
      directories: ["views"],
      patterns: [],
    },
    features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT],
  },

  [EFramework.LOOPBACK]: {
    name: EFramework.LOOPBACK,
    displayName: "LoopBack",
    description: "LoopBack Node.js framework project",
    fileIndicators: ["loopback.json"],
    packageIndicators: {
      dependencies: ["@loopback/core"],
    },
    lintPaths: ["src/**/*.ts"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.RESTIFY]: {
    name: EFramework.RESTIFY,
    displayName: "Restify",
    description: "Restify Node.js framework project",
    fileIndicators: [], // удалены общие server.js, index.js
    packageIndicators: {
      dependencies: ["restify"],
    },
    lintPaths: ["src/**/*.js"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT],
  },

  [EFramework.FEATHERS]: {
    name: EFramework.FEATHERS,
    displayName: "Feathers",
    description: "Feathers Node.js framework project",
    fileIndicators: ["feathers-cli.json"],
    packageIndicators: {
      dependencies: ["@feathersjs/feathers"],
    },
    lintPaths: ["src/**/*.js", "src/**/*.ts"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [
      EEslintFeature.NODE,
      EEslintFeature.JAVASCRIPT,
      EEslintFeature.TYPESCRIPT,
    ],
  },

  [EFramework.STRAPI]: {
    name: EFramework.STRAPI,
    displayName: "Strapi",
    description: "Strapi Headless CMS framework project",
    fileIndicators: [], // удалены неоднозначные конфигурационные файлы
    packageIndicators: {
      dependencies: ["strapi"],
    },
    lintPaths: ["src/**/*", "config/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [
      EEslintFeature.NODE,
      EEslintFeature.JAVASCRIPT,
      EEslintFeature.TYPESCRIPT,
    ],
  },

  [EFramework.MEDUSA]: {
    name: EFramework.MEDUSA,
    displayName: "Medusa",
    description: "Medusa JS eCommerce backend framework",
    fileIndicators: ["medusa-config.js", "medusa-config.ts"],
    packageIndicators: {
      dependencies: ["@medusajs/medusa"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.DIRECTUS]: {
    name: EFramework.DIRECTUS,
    displayName: "Directus",
    description: "Directus headless CMS project",
    fileIndicators: ["directus.config.js", "directus-extension.json"],
    packageIndicators: {
      dependencies: ["directus"],
    },
    lintPaths: ["extensions/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT],
  },

  [EFramework.KEYSTONE]: {
    name: EFramework.KEYSTONE,
    displayName: "Keystone",
    description: "Keystone.js headless CMS framework",
    fileIndicators: ["keystone.ts", "keystone.js"],
    packageIndicators: {
      dependencies: ["@keystone-6/core"],
    },
    lintPaths: ["schema/**/*", "routes/**/*"],
    ignorePath: {
      directories: [".keystone"],
      patterns: [],
    },
    features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT],
  },

  // --------------------
  // Desktop / Mobile
  // --------------------
  [EFramework.TAURI]: {
    name: EFramework.TAURI,
    displayName: "Tauri",
    description: "Tauri desktop application framework",
    fileIndicators: ["tauri.conf.json"],
    packageIndicators: {
      dependencies: ["@tauri-apps/api"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: ["src-tauri"],
      patterns: [],
    },
    features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.CAPACITOR]: {
    name: EFramework.CAPACITOR,
    displayName: "Capacitor",
    description: "Capacitor mobile application framework",
    fileIndicators: ["capacitor.config.json", "capacitor.config.ts"],
    packageIndicators: {
      dependencies: ["@capacitor/core"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: ["android", "ios"],
      patterns: [],
    },
    features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.IONIC]: {
    name: EFramework.IONIC,
    displayName: "Ionic",
    description: "Ionic mobile & desktop framework project",
    fileIndicators: ["ionic.config.json"],
    packageIndicators: {
      dependencies: ["@ionic/angular"],
      either: ["@ionic/react", "@ionic/vue"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: ["www"],
      patterns: [],
    },
    features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
  },

  [EFramework.REACT_NATIVE]: {
    name: EFramework.REACT_NATIVE,
    displayName: "React Native",
    description: "React Native mobile application project",
    fileIndicators: [], // удалены общие файлы index.js, App.js
    packageIndicators: {
      dependencies: ["react-native"],
      either: ["react"],
    },
    lintPaths: ["App.js", "src/**/*"],
    ignorePath: {
      directories: ["android", "ios"],
      patterns: [],
    },
    features: [
      EEslintFeature.REACT,
      EEslintFeature.JAVASCRIPT,
      EEslintFeature.PRETTIER,
    ],
  },

  [EFramework.FLUTTER]: {
    name: EFramework.FLUTTER,
    displayName: "Flutter",
    description: "Flutter cross-platform framework (Dart)",
    fileIndicators: ["pubspec.yaml"],
    packageIndicators: {
      dependencies: [],
      devDependencies: [],
    },
    lintPaths: [],
    ignorePath: {
      directories: [".dart_tool"],
      patterns: [],
    },
    features: [
      // для Dart ESLint нет, поэтому оставляем только Prettier
      EEslintFeature.PRETTIER,
    ],
  },

  [EFramework.EXPO]: {
    name: EFramework.EXPO,
    displayName: "Expo",
    description: "Expo framework for React Native apps",
    fileIndicators: ["app.json", "app.config.js"],
    packageIndicators: {
      dependencies: ["expo"],
      either: ["react", "react-native"],
    },
    lintPaths: ["App.js", "src/**/*"],
    ignorePath: {
      directories: ["ios", "android"],
      patterns: [],
    },
    features: [
      EEslintFeature.REACT,
      EEslintFeature.JAVASCRIPT,
      EEslintFeature.PRETTIER,
    ],
  },

  [EFramework.NATIVESCRIPT]: {
    name: EFramework.NATIVESCRIPT,
    displayName: "NativeScript",
    description: "NativeScript cross-platform framework",
    fileIndicators: ["nativescript.config.ts", "nativescript.config.js"],
    packageIndicators: {
      dependencies: ["nativescript"],
    },
    lintPaths: ["app/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [
      EEslintFeature.JAVASCRIPT,
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.PRETTIER,
    ],
  },

  // --------------------
  // Full-stack frameworks
  // --------------------
  [EFramework.REDWOOD]: {
    name: EFramework.REDWOOD,
    displayName: "RedwoodJS",
    description: "RedwoodJS full-stack framework project",
    fileIndicators: ["redwood.toml"],
    packageIndicators: {
      dependencies: ["@redwoodjs/core"],
    },
    lintPaths: ["api/src/**/*", "web/src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [
      EEslintFeature.REACT,
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.PRETTIER,
    ],
  },

  [EFramework.BLITZ]: {
    name: EFramework.BLITZ,
    displayName: "Blitz.js",
    description: "Blitz.js full-stack React framework",
    fileIndicators: ["blitz.config.js", "blitz.config.ts"],
    packageIndicators: {
      dependencies: ["blitz"],
      either: ["react", "react-dom"],
    },
    lintPaths: ["app/**/*"],
    ignorePath: {
      directories: [".blitz"],
      patterns: [],
    },
    features: [
      EEslintFeature.REACT,
      EEslintFeature.TYPESCRIPT,
      EEslintFeature.PRETTIER,
    ],
  },

  [EFramework.FRESH]: {
    name: EFramework.FRESH,
    displayName: "Fresh (Deno)",
    description: "Fresh full-stack framework for Deno",
    fileIndicators: ["fresh.config.ts"], // оставляем только fresh.config.ts
    packageIndicators: {},
    lintPaths: ["routes/**/*", "islands/**/*"],
    ignorePath: {
      directories: [".git", ".vscode"],
      patterns: [],
    },
    features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
  },

  // --------------------
  // Testing frameworks
  // --------------------
  [EFramework.JEST]: {
    name: EFramework.JEST,
    displayName: "Jest",
    description: "Jest testing framework config",
    fileIndicators: ["jest.config.js", "jest.config.ts"],
    packageIndicators: {
      devDependencies: ["jest"],
    },
    lintPaths: ["tests/**/*", "__tests__/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.CYPRESS]: {
    name: EFramework.CYPRESS,
    displayName: "Cypress",
    description: "Cypress end-to-end testing framework",
    fileIndicators: ["cypress.config.js", "cypress.config.ts"],
    packageIndicators: {
      devDependencies: ["cypress"],
    },
    lintPaths: ["cypress/**/*.js", "cypress/**/*.ts"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.VITEST]: {
    name: EFramework.VITEST,
    displayName: "Vitest",
    description: "Vitest testing framework for Vite",
    fileIndicators: ["vitest.config.js", "vitest.config.ts"],
    packageIndicators: {
      devDependencies: ["vitest"],
    },
    lintPaths: ["test/**/*", "src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.MOCHA]: {
    name: EFramework.MOCHA,
    displayName: "Mocha",
    description: "Mocha testing framework",
    fileIndicators: [".mocharc.js", ".mocharc.json"],
    packageIndicators: {
      devDependencies: ["mocha"],
    },
    lintPaths: ["test/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT],
  },

  [EFramework.JASMINE]: {
    name: EFramework.JASMINE,
    displayName: "Jasmine",
    description: "Jasmine testing framework",
    fileIndicators: ["jasmine.json"],
    packageIndicators: {
      devDependencies: ["jasmine"],
    },
    lintPaths: ["spec/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT],
  },

  [EFramework.KARMA]: {
    name: EFramework.KARMA,
    displayName: "Karma",
    description: "Karma test runner",
    fileIndicators: ["karma.conf.js"],
    packageIndicators: {
      devDependencies: ["karma"],
    },
    lintPaths: ["test/**/*", "src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT],
  },

  [EFramework.PLAYWRIGHT]: {
    name: EFramework.PLAYWRIGHT,
    displayName: "Playwright",
    description: "Playwright end-to-end testing framework",
    fileIndicators: ["playwright.config.js", "playwright.config.ts"],
    packageIndicators: {
      devDependencies: ["@playwright/test"],
    },
    lintPaths: ["tests/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.TYPESCRIPT, EEslintFeature.JAVASCRIPT],
  },

  [EFramework.PUPPETEER]: {
    name: EFramework.PUPPETEER,
    displayName: "Puppeteer",
    description: "Puppeteer testing / automation tool",
    fileIndicators: [],
    packageIndicators: {
      devDependencies: ["puppeteer"],
    },
    lintPaths: ["tests/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT],
  },

  [EFramework.WEBDRIVERIO]: {
    name: EFramework.WEBDRIVERIO,
    displayName: "WebdriverIO",
    description: "WebdriverIO end-to-end testing framework",
    fileIndicators: ["wdio.conf.js"],
    packageIndicators: {
      devDependencies: ["webdriverio"],
    },
    lintPaths: ["tests/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT],
  },

  [EFramework.NIGHTWATCH]: {
    name: EFramework.NIGHTWATCH,
    displayName: "Nightwatch",
    description: "Nightwatch.js end-to-end testing framework",
    fileIndicators: ["nightwatch.conf.js"],
    packageIndicators: {
      devDependencies: ["nightwatch"],
    },
    lintPaths: ["tests/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT],
  },

  // -------------------------
  // UI Component Libraries
  // -------------------------
  [EFramework.MATERIAL_UI]: {
    name: EFramework.MATERIAL_UI,
    displayName: "Material-UI (MUI)",
    description: "Material-UI React UI library project",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["@mui/material", "@mui/core", "@emotion/react"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.CHAKRA_UI]: {
    name: EFramework.CHAKRA_UI,
    displayName: "Chakra UI",
    description: "Chakra UI React component library",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["@chakra-ui/react"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.TAILWIND]: {
    name: EFramework.TAILWIND,
    displayName: "Tailwind CSS",
    description: "Tailwind CSS setup project",
    fileIndicators: ["tailwind.config.js", "tailwind.config.ts"],
    packageIndicators: {
      devDependencies: ["tailwindcss"],
    },
    lintPaths: [],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.TAILWIND_CSS],
  },

  [EFramework.BOOTSTRAP]: {
    name: EFramework.BOOTSTRAP,
    displayName: "Bootstrap",
    description: "Bootstrap UI library project",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["bootstrap"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT],
  },

  [EFramework.ANTD]: {
    name: EFramework.ANTD,
    displayName: "Ant Design",
    description: "Ant Design React UI library project",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["antd"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.STORYBOOK]: {
    name: EFramework.STORYBOOK,
    displayName: "Storybook",
    description: "Storybook UI component explorer",
    fileIndicators: [".storybook/main.js", ".storybook/main.ts"],
    packageIndicators: {
      devDependencies: [
        "@storybook/react",
        "@storybook/vue",
        "@storybook/svelte",
      ],
    },
    lintPaths: ["stories/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [
      EEslintFeature.REACT,
      EEslintFeature.JAVASCRIPT,
      EEslintFeature.TYPESCRIPT,
    ],
  },

  [EFramework.STYLED_COMPONENTS]: {
    name: EFramework.STYLED_COMPONENTS,
    displayName: "Styled Components",
    description: "Styled Components for React",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["styled-components"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
  },

  // ------------------
  // State Management
  // ------------------
  [EFramework.REDUX]: {
    name: EFramework.REDUX,
    displayName: "Redux",
    description: "Redux state management for React",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["redux"],
      either: ["react-redux"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.MOBX]: {
    name: EFramework.MOBX,
    displayName: "MobX",
    description: "MobX state management for JavaScript/React",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["mobx"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.RECOIL]: {
    name: EFramework.RECOIL,
    displayName: "Recoil",
    description: "Recoil state management for React",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["recoil"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.ZUSTAND]: {
    name: EFramework.ZUSTAND,
    displayName: "Zustand",
    description: "Zustand state management for React",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["zustand"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.JOTAI]: {
    name: EFramework.JOTAI,
    displayName: "Jotai",
    description: "Jotai atomic state management for React",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["jotai"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.XSTATE]: {
    name: EFramework.XSTATE,
    displayName: "XState",
    description: "XState state machines for JS/TS",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["xstate"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.PINIA]: {
    name: EFramework.PINIA,
    displayName: "Pinia",
    description: "Pinia state management for Vue",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["pinia"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.TYPESCRIPT],
  },

  // ------------------
  // Build Tools
  // ------------------
  [EFramework.WEBPACK]: {
    name: EFramework.WEBPACK,
    displayName: "Webpack",
    description: "Webpack bundler project",
    fileIndicators: ["webpack.config.js", "webpack.config.ts"],
    packageIndicators: {
      devDependencies: ["webpack", "webpack-cli"],
    },
    lintPaths: [],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.ROLLUP]: {
    name: EFramework.ROLLUP,
    displayName: "Rollup",
    description: "Rollup bundler project",
    fileIndicators: ["rollup.config.js", "rollup.config.ts"],
    packageIndicators: {
      devDependencies: ["rollup"],
    },
    lintPaths: [],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.PARCEL]: {
    name: EFramework.PARCEL,
    displayName: "Parcel",
    description: "Parcel bundler project",
    fileIndicators: [],
    packageIndicators: {
      devDependencies: ["parcel"],
    },
    lintPaths: [],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.ESBUILD]: {
    name: EFramework.ESBUILD,
    displayName: "esbuild",
    description: "esbuild bundler project",
    fileIndicators: [],
    packageIndicators: {
      devDependencies: ["esbuild"],
    },
    lintPaths: [],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.TURBOPACK]: {
    name: EFramework.TURBOPACK,
    displayName: "Turbopack",
    description: "Turbopack (experimental bundler by Vercel)",
    fileIndicators: [],
    packageIndicators: {
      devDependencies: ["@vercel/turbopack"],
    },
    lintPaths: [],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.SNOWPACK]: {
    name: EFramework.SNOWPACK,
    displayName: "Snowpack",
    description: "Snowpack build tool project",
    fileIndicators: ["snowpack.config.js", "snowpack.config.ts"],
    packageIndicators: {
      devDependencies: ["snowpack"],
    },
    lintPaths: [],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
  },

  // ------------------
  // API/GraphQL
  // ------------------
  [EFramework.APOLLO]: {
    name: EFramework.APOLLO,
    displayName: "Apollo",
    description: "Apollo GraphQL client/server project",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["@apollo/client", "apollo-server"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.TYPESCRIPT],
  },

  [EFramework.TRPC]: {
    name: EFramework.TRPC,
    displayName: "tRPC",
    description: "tRPC end-to-end typesafe API",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["@trpc/server", "@trpc/client"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.TYPESCRIPT],
  },

  [EFramework.GRAPHQL]: {
    name: EFramework.GRAPHQL,
    displayName: "GraphQL",
    description: "Generic GraphQL usage (apollo, graphql.js, etc.)",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["graphql"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.TYPESCRIPT],
  },

  [EFramework.RELAY]: {
    name: EFramework.RELAY,
    displayName: "Relay",
    description: "Relay GraphQL client for React",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["react-relay", "relay-runtime"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.TANSTACK_QUERY]: {
    name: EFramework.TANSTACK_QUERY,
    displayName: "TanStack Query (React Query)",
    description: "TanStack React Query for data fetching",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["@tanstack/react-query"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.SWR]: {
    name: EFramework.SWR,
    displayName: "SWR",
    description: "SWR React hooks library for data fetching",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["swr"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
  },

  // --------------------
  // Development Tools
  // --------------------
  [EFramework.PRETTIER]: {
    name: EFramework.PRETTIER,
    displayName: "Prettier",
    description: "Prettier code formatter configuration",
    fileIndicators: [".prettierrc", ".prettierrc.js", "prettier.config.js"],
    packageIndicators: {
      devDependencies: ["prettier"],
    },
    lintPaths: [],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.PRETTIER],
  },

  [EFramework.ESLINT]: {
    name: EFramework.ESLINT,
    displayName: "ESLint",
    description: "ESLint configuration",
    fileIndicators: [".eslintrc", ".eslintrc.js", ".eslintrc.json"],
    packageIndicators: {
      devDependencies: ["eslint"],
    },
    lintPaths: [],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.BABEL]: {
    name: EFramework.BABEL,
    displayName: "Babel",
    description: "Babel compiler configuration",
    fileIndicators: ["babel.config.js", ".babelrc"],
    packageIndicators: {
      devDependencies: ["@babel/core"],
    },
    lintPaths: [],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.TYPESCRIPT]: {
    name: EFramework.TYPESCRIPT,
    displayName: "TypeScript",
    description: "TypeScript configuration project",
    fileIndicators: ["tsconfig.json"],
    packageIndicators: {
      devDependencies: ["typescript"],
    },
    lintPaths: [],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.TYPESCRIPT],
  },

  [EFramework.POSTCSS]: {
    name: EFramework.POSTCSS,
    displayName: "PostCSS",
    description: "PostCSS configuration project",
    fileIndicators: ["postcss.config.js"],
    packageIndicators: {
      devDependencies: ["postcss"],
    },
    lintPaths: [],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [],
  },

  [EFramework.SASS]: {
    name: EFramework.SASS,
    displayName: "Sass/SCSS",
    description: "Sass/SCSS preprocessor configuration",
    fileIndicators: [],
    packageIndicators: {
      devDependencies: ["sass"],
    },
    lintPaths: [],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [],
  },

  [EFramework.LESS]: {
    name: EFramework.LESS,
    displayName: "Less",
    description: "Less CSS preprocessor configuration",
    fileIndicators: [],
    packageIndicators: {
      devDependencies: ["less"],
    },
    lintPaths: [],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [],
  },

  // ----------------
  // Server Side
  // ----------------
  [EFramework.PRISMA]: {
    name: EFramework.PRISMA,
    displayName: "Prisma",
    description: "Prisma ORM configuration",
    fileIndicators: ["prisma/schema.prisma"],
    packageIndicators: {
      devDependencies: ["prisma"],
      dependencies: ["@prisma/client"],
    },
    lintPaths: [],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.TYPESCRIPT],
  },

  [EFramework.SEQUELIZE]: {
    name: EFramework.SEQUELIZE,
    displayName: "Sequelize",
    description: "Sequelize ORM configuration",
    fileIndicators: ["sequelize.config.js", ".sequelizerc"],
    packageIndicators: {
      dependencies: ["sequelize"],
    },
    lintPaths: ["models/**/*", "migrations/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.TYPEORM]: {
    name: EFramework.TYPEORM,
    displayName: "TypeORM",
    description: "TypeORM configuration",
    fileIndicators: ["ormconfig.json", "ormconfig.js", "ormconfig.ts"],
    packageIndicators: {
      dependencies: ["typeorm"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.TYPEORM, EEslintFeature.TYPESCRIPT],
  },

  [EFramework.MONGOOSE]: {
    name: EFramework.MONGOOSE,
    displayName: "Mongoose",
    description: "Mongoose ODM for MongoDB",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["mongoose"],
    },
    lintPaths: ["models/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT],
  },

  [EFramework.DRIZZLE]: {
    name: EFramework.DRIZZLE,
    displayName: "Drizzle ORM",
    description: "Drizzle ORM for TypeScript",
    fileIndicators: [],
    packageIndicators: {
      dependencies: ["drizzle-orm"],
    },
    lintPaths: ["src/**/*"],
    ignorePath: {
      directories: [],
      patterns: [],
    },
    features: [EEslintFeature.TYPESCRIPT],
  },
};
