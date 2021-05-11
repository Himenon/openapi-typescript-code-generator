import { posix as path } from "path";

import { ParsedSchema } from "../types";

export interface ReferencePathSet {
  pathArray: string[];
  base: string;
}

export interface ResolveReferencePath {
  name: string;
  maybeResolvedName: string;
  unresolvedPaths: string[];
}

export class ConvertContext {
  constructor(private accessor: ParsedSchema.Accessor, private entryPoint: string) {}

  private generatePath(currentPoint: string, referencePath: string): ReferencePathSet {
    const ext = path.extname(currentPoint); // .yml
    const from = path.relative(path.dirname(this.entryPoint), currentPoint).replace(ext, ""); // components/schemas/A/B
    const dirname = path.dirname(from).replace(path.sep, "/");
    const result = path.relative(dirname, referencePath); // remoteの場合? localの場合 referencePath.split("/")
    const pathArray = result.split("/");
    return {
      pathArray,
      base: dirname,
    };
  }

  private calculateReferencePath(base: string, pathArray: string[]): ResolveReferencePath {
    let names: string[] = [];
    let unresolvedPaths: string[] = [];
    pathArray.reduce((previous, lastPath, index) => {
      const current = path.join(previous, lastPath);
      // ディレクトリが深い場合は相対パスが`..`を繰り返す可能性があり、
      // その場合はすでに登録されたnamesを削除する
      if (lastPath === ".." && names.length > 0) {
        names = names.slice(0, names.length - 1);
      }
      const isFinalPath = index === pathArray.length - 1;
      if (isFinalPath) {
        const statement = this.accessor.getStatement(current, "interface");
        const statement2 = this.accessor.getStatement(current, "typeAlias");
        const statement3 = this.accessor.getStatement(current, "namespace");
        if (statement) {
          names.push(statement.name);
          return current;
        } else if (statement2) {
          names.push(statement2.name);
          return current;
        } else if (statement3) {
          names.push(statement3.name);
          return current;
        } else {
          unresolvedPaths.push(lastPath);
        }
      } else {
        const statement = this.accessor.getStatement(current, "namespace");
        if (statement) {
          unresolvedPaths = unresolvedPaths.slice(0, unresolvedPaths.length - 1);
          names.push(statement.name);
        } else {
          unresolvedPaths.push(lastPath);
        }
      }
      return current;
    }, base);
    if (names.length === 0) {
      throw new Error("Local Reference Error \n" + JSON.stringify({ pathArray, names, base }, null, 2));
    }
    return {
      name: names.join("."),
      maybeResolvedName: names.concat(unresolvedPaths).join("."),
      unresolvedPaths,
    };
  }

  public resolveReferencePath(currentPoint: string, referencePath: string) {
    const { pathArray, base } = this.generatePath(currentPoint, referencePath);
    return this.calculateReferencePath(base, pathArray);
  }
}
