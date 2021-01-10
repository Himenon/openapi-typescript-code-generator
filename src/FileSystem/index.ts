import * as fs from "fs";
import * as path from "path";

import Dot from "dot-prop";
import * as yaml from "js-yaml";

import { UnSupportError } from "../Exception";

export interface Type {
  existSync: (entrypoint: string) => boolean;
  loadJsonOrYaml: (entryPoint: string) => any;
}

const create = (): Type => {
  const FRAGMENT = "#/";

  const loadJsonOrYaml = (filename: string): any => {
    const ext = path.extname(filename);
    const data = fs.readFileSync(filename, { encoding: "utf-8" });
    switch (ext) {
      case ".json":
        return JSON.parse(data);
      case ".yml":
      case ".yaml":
        return yaml.load(data);
      default:
        throw new UnSupportError(`Not support file: ${filename}`);
    }
  };
  return {
    existSync: (entryPoint: string): boolean => {
      return !!(fs.existsSync(entryPoint) && fs.statSync(entryPoint).isFile());
    },
    loadJsonOrYaml: (entryPoint: string): any => {
      const hasFragment: boolean = new RegExp(FRAGMENT).test(entryPoint);
      if (hasFragment) {
        const [filename, fragment] = entryPoint.split(FRAGMENT);
        const data = loadJsonOrYaml(filename);
        return Dot.get(data, fragment.replace(/\//g, "."));
      }
      return loadJsonOrYaml(entryPoint);
    },
  };
};

export const fileSystem = create();
