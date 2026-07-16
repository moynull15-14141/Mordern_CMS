/* eslint-disable @typescript-eslint/no-require-imports */
const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({ recommendedConfig: true });

module.exports = [
  {
    ignores: [
      "**/node_modules/**",
      "**/.pnpm/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
      "**/*.log",
    ],
  },
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ),
  {
    files: ["**/*.{js,ts,tsx}"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "warn",
    },
  },
  {
    files: ["apps/backend/**/*.{js,ts}"],
    languageOptions: {
      globals: {
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
      },
    },
  },
  {
    files: ["apps/web/**/*.{js,ts,tsx}", "apps/admin/**/*.{js,ts,tsx}"],
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
      },
    },
  },
];
