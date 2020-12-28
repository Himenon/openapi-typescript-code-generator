import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { UnSupportError } from "../Exception";

export interface Type {
  existSync: (entrypoint: string) => boolean;
  loadJsonOrYaml: (entryPoint: string) => any;
}

const create = (): Type => {
  return {
    existSync: (entryPoint: string): boolean => {
      return !!(fs.existsSync(entryPoint) && fs.statSync(entryPoint).isFile());
    },
    loadJsonOrYaml: (entryPoint: string): any => {
      const ext = path.extname(entryPoint);
      const data = fs.readFileSync(entryPoint, { encoding: "utf-8" });
      switch (ext) {
        case ".json":
          return JSON.parse(data);
        case ".yml":
        case ".yaml":
          return yaml.safeLoad(data);
        default:
          throw new UnSupportError(`Not support file: ${entryPoint}`);
      }
    },
  };
};

export const fileSystem = create();
