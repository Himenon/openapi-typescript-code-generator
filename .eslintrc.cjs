/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:import/typescript", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    project: ["tsconfig.json"],
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "simple-import-sort", "unused-imports"],
  rules: {
    eqeqeq: "error",
    "no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/ban-types": [
      "error",
      {
        types: {
          // un-ban a type that's banned by default
          "{}": false,
        },
        extendDefaults: true,
      },
    ],
    "@typescript-eslint/no-explicit-any": "off",
  },
  overrides: [
    {
      files: ["examples/**"],
      rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-namespace": "off",
      },
    },
  ],
};
