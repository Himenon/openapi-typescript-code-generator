import * as fs from "fs";
import { posix as path } from "path";
import { promisify } from "util";

import { readPackageUp } from "read-package-up";
import * as rimraf from "rimraf";

const mkDir = promisify(fs.mkdir);
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);

export interface Option {
  name?: string;
  inputDir: string;
  cwd: string;
  cjsDir: string;
  esmDir: string;
  typesDir?: string;
}

interface ProxyPackage {
  name: string;
  private: true;
  main: string;
  module: string;
  types?: string;
}

const isFile = (path: string) =>
  stat(path)
    .then(stats => stats.isFile())
    .catch(() => false);

const withDefaults = ({ cwd = ".", ...options }: Option, additionalDefaults: { cjsDir?: string; esmDir?: string } = {}): Option => ({
  cwd: path.join(process.cwd(), cwd),
  ...additionalDefaults,
  ...options,
});

const noop = () => undefined;

const findFiles = async ({ cwd, inputDir }: { cwd: string; inputDir: string }) => {
  const filePaths = fs.readdirSync(path.join(cwd, inputDir)).filter(p => p.match(/\.(js|jsx|ts|tsx)/));
  return filePaths.filter(f => !f.endsWith(".d.ts")).map(filePath => path.basename(filePath).replace(/\.(js|ts)x?$/, ""));
};

const pkgCache = new WeakMap();

const getPkgName = async (options: Option) => {
  if (options.name !== null) {
    return options.name;
  }
  if (pkgCache.has(options)) {
    return pkgCache.get(options);
  }
  const result = await readPackageUp({ cwd: options.cwd });
  if (!result) {
    throw new Error("Could not determine package name. No `name` option was passed and no package.json was found relative to: " + options.cwd);
  }
  const pkgName = result.packageJson.name;
  pkgCache.set(options, pkgName);
  return pkgName;
};

const fileProxy = async (options: Option, file?: string) => {
  const { cwd, cjsDir, esmDir, typesDir } = options;
  const pkgName = await getPkgName(options);

  const proxyPkg: ProxyPackage = {
    name: `${pkgName}/${file}`,
    private: true,
    main: path.join("..", cjsDir, `${file}.js`),
    module: path.join("..", esmDir, `${file}.js`),
  };

  if (typeof typesDir === "string") {
    proxyPkg.types = path.join("..", typesDir, `${file}.d.ts`);
  } else if (await isFile(path.join(cwd, `${file}.d.ts`))) {
    proxyPkg.types = path.join("..", `${file}.d.ts`);
    // try the esm path in case types are located with each
  } else if (await isFile(path.join(cwd, esmDir, `${file}.d.ts`))) {
    proxyPkg.types = path.join("..", esmDir, `${file}.d.ts`);
  }

  return JSON.stringify(proxyPkg, null, 2) + "\n";
};

export const cherryPick = async (inputOptions: Option) => {
  const options = withDefaults(inputOptions, {
    cjsDir: "lib",
    esmDir: "es",
  });

  const files = await findFiles(options);

  await Promise.all(
    files.map(async file => {
      const proxyDir = path.join(options.cwd, file);
      await mkDir(proxyDir).catch(noop);
      await writeFile(`${proxyDir}/package.json`, await fileProxy(options, file));
    }),
  );

  return files;
};

export const clean = async (inputOptions: Option) => {
  const options = withDefaults(inputOptions);
  const files = await findFiles(options);

  await Promise.all(files.map(async file => rimraf.sync(path.join(options.cwd, file))));
  return files;
};
