/**
 * @type {import("@jest/types").Config.InitialOptions}
 */
module.exports = {
  automock: false,
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
  roots: ["<rootDir>/src"],
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
  transformIgnorePatterns: ["/node_modules/(?!|dot-prop)"],
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  unmockedModulePathPatterns: ["<rootDir>/node_modules/*"],
};
