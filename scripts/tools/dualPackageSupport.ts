import * as fs from "fs";
import { posix as path } from "path";

export type SupportModuleType = "node" | "require" | "import" | "default";

export type SupportModule = {
  // eslint-disable-next-line no-unused-vars
  [P in SupportModuleType]?: string;
};

export interface Option {
  directory: Partial<SupportModule>;
}

export interface ExportsField {
  [filepath: string]: SupportModule;
}

const isFile = (p: string) => {
  return fs.existsSync(p) && fs.statSync(p).isFile();
};

const isTypeScriptFile = (p: string): boolean => {
  return !!p.match(/tsx?$/);
};

const isIndexFile = (p: string) => {
  return !!p.match(/index\.tsx?$/);
};

const convertNameTsToJs = (p: string): string => {
  return p.replace(/\.tsx?$/, ".js");
};

const isSupportModuleType = (text: string | undefined): text is SupportModuleType => {
  if (!text) {
    return false;
  }
  return ["node", "require", "import", "default"].includes(text);
};

const trimExtension = (p: string): string => {
  const ext = path.extname(p);
  return p.replace(new RegExp(ext + "$"), "");
};

export const generateExportsField = (sourceRootDirectory: string, option: Option): ExportsField => {
  const pathArray = fs.readdirSync(sourceRootDirectory);
  const filteredPathArray = pathArray.filter(p => {
    const pathName = path.join(sourceRootDirectory, p);
    return isTypeScriptFile(pathName) && isFile(pathName);
  });
  return filteredPathArray.reduce<ExportsField>((exportsFields, pathName) => {
    const filepath = isIndexFile(pathName) ? "." : "./" + trimExtension(pathName);
    const jsFilename = convertNameTsToJs(pathName);
    const supportModule: SupportModule = {};
    Object.entries(option.directory).forEach(([key, exportBaseDirectory]) => {
      if (isSupportModuleType(key) && typeof exportBaseDirectory === "string") {
        supportModule[key] = "./" + path.join(exportBaseDirectory, jsFilename);
      }
    });
    return { ...exportsFields, [filepath]: supportModule };
  }, {});
};
