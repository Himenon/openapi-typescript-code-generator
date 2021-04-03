import * as fs from "fs";
import * as path from "path";

import cpy from "cpy";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../../package.json");

/**
 * README, LICENCE, CHANGELOG.mdをlibディレクトリに出力する
 */
export const copyPackageSet = async (exportsField: {}): Promise<void> => {
  const libDir = "lib";
  const publishPackageJson = path.join(libDir, "package.json");
  pkg.private = undefined;
  pkg.main = path.posix.relative(libDir, pkg.main);
  pkg.browser = path.posix.relative(libDir, pkg.browser);
  pkg.module = path.posix.relative(libDir, pkg.module);
  pkg.types = path.posix.relative(libDir, pkg.types);
  pkg.directories = undefined;
  pkg.files = undefined;
  pkg.exports = exportsField;
  fs.writeFileSync(publishPackageJson, JSON.stringify(pkg, null, 2), {
    encoding: "utf-8",
  });
  await cpy(["README.md", "CHANGELOG.md", "LICENCE"], libDir);
  console.log("Files copied!");
};
