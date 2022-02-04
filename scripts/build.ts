import "./clean.js";

import { cherryPick } from "./tools/cherry-pick.js";
import { copyPackageSet } from "./tools/copyPackageSet.js";
import { generateExportsField } from "./tools/dualPackageSupport.js";
import { shell } from "./tools/shell.js";

const main = async () => {
  await Promise.all([
    shell("yarn tsc -p tsconfig.esm.json -d --emitDeclarationOnly --outDir ./lib/\\$types"),
    shell("yarn tsc -p tsconfig.cjs.json"),
    shell("yarn tsc -p tsconfig.esm.json"),
  ]);

  await cherryPick({ inputDir: "../src", cwd: "./lib", typesDir: "./$types", cjsDir: "./$cjs", esmDir: "./$esm" });

  const exportsFiled = generateExportsField("./src", {
    directory: {
      import: "./$esm",
      // require: "./$cjs", // OFFにするとwebpack 5でesmを読んでくれる
      node: "./$cjs",
      browser: "./$esm",
      default: "./$cjs",
    },
  });

  await copyPackageSet(exportsFiled);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
