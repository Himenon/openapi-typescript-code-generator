import "./clean";
import { shell } from "./tools/shell";
import { copyPackageSet } from "./tools/copyPackageSet";

const main = async () => {
  await Promise.all([
    shell("yarn tsc -p tsconfig.esm.json -d --emitDeclarationOnly --outDir ./lib/\\$types"),
    shell("yarn tsc -p tsconfig.cjs.json"),
    shell("yarn tsc -p tsconfig.esm.json"),
  ]);
  await shell("cherry-pick --cwd ./lib --input-dir ../src --types-dir ./\\$types --cjs-dir ./\\$cjs --esm-dir ./\\$esm");
  await copyPackageSet();
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
