import "./clean";

import pkg from "../package.json";
import * as fs from "fs";
import { EOL } from "os";
import { cherryPick } from "./tools/cherry-pick";
import { copyPackageSet } from "./tools/copyPackageSet";
import { generateExportsField } from "./tools/dualPackageSupport";
import { shell } from "./tools/shell";

const generateVersionTsFile = () => {
  const codes: string[] = [`export const Name = "${pkg.name}";`, `export const Version = "${pkg.version}";`];
  const tscCode = codes.join(EOL);
  console.log("Update src/meta.ts file.");
  const snapshot = fs.readFileSync("src/meta.ts", "utf-8");
  fs.writeFileSync("src/meta.ts", tscCode, "utf-8");
  return () => {
    fs.writeFileSync("src/meta.ts", snapshot, "utf-8");
  };
};

const main = async () => {
  const recovery = generateVersionTsFile();

  await Promise.all([
    shell("pnpm tsc -p tsconfig.esm.json -d --emitDeclarationOnly --outDir ./lib/\\$types"),
    shell("pnpm tsc -p tsconfig.cjs.json"),
    shell("pnpm tsc -p tsconfig.esm.json"),
  ]);

  await cherryPick({ inputDir: "../src", cwd: "./lib", typesDir: "./$types", cjsDir: "./$cjs", esmDir: "./$esm" });

  const exportsFiled = generateExportsField("./src", {
    directory: {
      import: "./$esm",
      // require: "./$cjs", // OFFにするとwebpack 5でesmを読んでくれる
      node: "./$cjs",
      browser: "./$esm",
      default: "./$cjs",
      types: "./$types",
    },
  });

  await copyPackageSet(exportsFiled);
  recovery();
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
