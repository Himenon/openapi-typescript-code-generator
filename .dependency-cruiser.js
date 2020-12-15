module.exports = {
  extends: "dependency-cruiser/configs/recommended-strict",
  /*
       the 'dependency-cruiser/configs/recommended-strict' preset
       contains these rules:
       no-circular            - flags all circular dependencies
       no-orphans             - flags orphan modules (except typescript .d.ts files)
       no-deprecated-core     - flags dependencies on deprecated node 'core' modules
       no-deprecated-npm      - flags dependencies on deprecated npm modules
       no-non-package-json    - flags (npm) dependencies that don't occur in package.json
       not-to-unresolvable    - flags dependencies that can't be resolved
       no-duplicate-dep-types - flags dependencies that occur more than once in package.json

       If you need to, you can override these rules. E.g. to ignore the
       no-duplicate-dep-types rule, you can set its severity to "ignore" by
       adding this to the 'forbidden' section:
       {
            name: 'no-duplicate-dep-types',
            severity: 'ignore'
       }

       Also, by default, the preset does not follow any external modules (things in
       node_modules or in yarn's plug'n'play magic). If you want to have that
       differently, just override it the options.doNotFollow key.
     */
  forbidden: [
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
      },
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
      },
    },
  ],
  options: {
    /* conditions specifying which files not to follow further when encountered:
           - path: a regular expression to match
           - dependencyTypes: see https://github.com/sverweij/dependency-cruiser/blob/develop/doc/rules-reference.md#dependencytypes
             for a complete list
        */
    doNotFollow: {
      // path: 'node_modules',
      dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer", "npm-bundled", "npm-no-pkg"],
    },

    /* conditions specifying which dependencies to exclude 
           - path: a regular expression to match
           - dynamic: a boolean indicating whether to ignore dynamic (true) or static (false) dependencies.
                    leave out if you want to exclude neither (recommended!)
        */
    // , exclude : {
    //   path: ''
    //   , dynamic: true
    // }

    /* pattern specifying which files to include (regular expression) 
           dependency-cruiser will skip everything not matching this pattern
        */
    // , includeOnly : ''

    /* list of module systems to cruise */
    // , moduleSystems: ['amd', 'cjs', 'es6', 'tsd']

    /* prefix for links in html and svg output (e.g. https://github.com/you/yourrepo/blob/develop/) */
    // , prefix: ''

    /* if true detect dependencies that only exist before typescript-to-javascript compilation */
    tsPreCompilationDeps: true,

    /* if true combines the package.jsons found from the module up to the base
           folder the cruise is initiated from. Useful for how (some) mono-repos
           manage dependencies & dependency definitions.
         */
    // , combinedDependencies: false

    /* if true leave symlinks untouched, otherwise use the realpath */
    // , preserveSymlinks: false

    /* Typescript project file ('tsconfig.json') to use for
           (1) compilation and
           (2) resolution (e.g. with the paths property)

           The (optional) fileName attribute specifies which file to take (relative to
           dependency-cruiser's current working directory). When not provided
           defaults to './tsconfig.json'.
         */
    tsConfig: {
      fileName: "./tsconfig.json",
    },

    /* Webpack configuration to use to get resolve options from.

          The (optional) fileName attribute specifies which file to take (relative to dependency-cruiser's
          current working directory. When not provided defaults to './webpack.conf.js'.

          The (optional) `env` and `args` attributes contain the parameters to be passed if
          your webpack config is a function and takes them (see webpack documentation
          for details)
         */
    // , webpackConfig: {
    //    fileName: './webpack.conf.js'
    //    , env: {}
    //    , args: {}
    // }

    /* How to resolve external modules - use "yarn-pnp" if you're using yarn's Plug'n'Play.
           otherwise leave it out (or set to the default, which is 'node_modules')
        */
    // , externalModuleResolutionStrategy: 'node_modules'
  },
};
// generated: dependency-cruiser@5.3.2 on 2019-11-21T01:41:12.817Z
