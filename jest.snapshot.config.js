module.exports = {
  automock: false,
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json",
      diagnostics: false,
    },
  },
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
  roots: ["<rootDir>/test"],
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  unmockedModulePathPatterns: ["<rootDir>/node_modules/*"],
};
