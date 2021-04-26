module.exports = {
  extends: "dependency-cruiser/configs/recommended-strict",
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Found a circular reference, please fix it.",
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: "Invalid Code Template Dependency",
      severity: "error",
      from: {
        path: "^src/code-templates",
      },
      to: {
        path: "^src/internal",
      },
    },
    {
      name: "Don't dependent on typescript from Walker",
      severity: "error",
      from: {
        path: "^src/internal/OpenApiTools",
      },
      to: {
        path: "typescript",
      },
    },
    {
      name: "not-to-test",
      comment:
        "This module depends on code within a folder that should only contain tests. As tests don't " +
        "implement functionality this is odd. Either you're writing a test outside the test folder " +
        "or there's something in the test folder that isn't a test.",
      severity: "error",
      from: {
        pathNot: "^(test|spec)",
      },
      to: {
        path: "^(test|spec)",
      },
    },
    {
      name: "not-to-spec",
      comment:
        "This module depends on a spec (test) file. The sole responsibility of a spec file is to test code. " +
        "If there's something in a spec that's of use to other modules, it doesn't have that single " +
        "responsibility anymore. Factor it out into (e.g.) a separate utility/ helper or a mock.",
      severity: "error",
      from: {},
      to: {
        path: "\\.spec\\.(js|ts|ls|coffee|litcoffee|coffee\\.md)$",
      },
    },
    {
      name: "not-to-dev-dep",
      severity: "error",
      comment:
        "This module depends on an npm package from the 'devDependencies' section of your " +
        "package.json. It looks like something that ships to production, though. To prevent problems " +
        "with npm packages that aren't there on production declare it (only!) in the 'dependencies'" +
        "section of your package.json. If this module is development only - add it to the " +
        "from.pathNot re of the not-to-dev-dep rule in the dependency-cruiser configuration",
      from: {
        path: "^(src|app|lib)",
        pathNot: "\\.spec\\.(js|ts|ls|coffee|litcoffee|coffee\\.md)$",
      },
      to: {
        dependencyTypes: ["npm-dev"],
        pathNot: "typescript",
      },
    },
    {
      name: "no-duplicate-dep-types",
      severity: "ignore",
    },
    {
      name: "optional-deps-used",
      severity: "info",
      comment:
        "This module depends on an npm package that is declared as an optional dependency " +
        "in your package.json. As this makes sense in limited situations only, it's flagged here. " +
        "If you're using an optional dependency here by design - add an exception to your" +
        "depdency-cruiser configuration.",
      from: {},
      to: {
        dependencyTypes: ["npm-optional"],
      },
    },
    {
      name: "peer-deps-used",
      comment:
        "This module depends on an npm package that is declared as a peer dependency " +
        "in your package.json. This makes sense if your package is e.g. a plugin, but in " +
        "other cases - maybe not so much. If the use of a peer dependency is intentional " +
        "add an exception to your dependency-cruiser configuration.",
      severity: "warn",
      from: {},
      to: {
        dependencyTypes: ["npm-peer"],
        pathNot: "typescript",
      },
    },
  ],
  options: {
    doNotFollow: {
      dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer", "npm-bundled", "npm-no-pkg"],
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: "./tsconfig.json",
    },
  },
};
