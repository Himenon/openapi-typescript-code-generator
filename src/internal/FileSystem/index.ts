import * as fs from "fs";
import * as path from "path";

import Dot from "dot-prop";
import * as yaml from "js-yaml";

import { UnSupportError } from "../Exception";

export interface Type {
  existSync: (entrypoint: string) => boolean;
  loadJsonOrYaml: (entryPoint: string) => any;
}

export class FileSystem {
  private static FRAGMENT = "#/";
  private static internalLoadJsonOrYaml (filename: string): any {
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

  public static existSync(entryPoint: string): boolean {
    return !!(fs.existsSync(entryPoint) && fs.statSync(entryPoint).isFile());
  }

  public static loadJsonOrYaml(entryPoint: string): any {
    const hasFragment: boolean = new RegExp(this.FRAGMENT).test(entryPoint);
    if (hasFragment) {
      const [filename, fragment] = entryPoint.split(this.FRAGMENT);
      const data = this.internalLoadJsonOrYaml(filename);
      return Dot.get(data, fragment.replace(/\//g, "."));
    }
    return this.internalLoadJsonOrYaml(entryPoint);
  };
}
