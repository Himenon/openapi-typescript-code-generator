/**
 * @type {import("@jest/types").Config.InitialOptions}
 */
module.exports = {
  automock: false,
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
  roots: ["<rootDir>/test"],
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser :{
            syntax: "typescript"
          }
        }
      },
    ],
  },
  unmockedModulePathPatterns: ["<rootDir>/node_modules/*"],
};
