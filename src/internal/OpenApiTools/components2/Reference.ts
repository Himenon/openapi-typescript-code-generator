import { posix as path } from "path";

import type { OpenApi } from "../../../types";
import type { InitializeParams } from "./types";

export type LocalReferencePattern =
  | "#/components/schemas/"
  | "#/components/responses/"
  | "#/components/parameters/"
  | "#/components/examples/"
  | "#/components/requestBodies/"
  | "#/components/headers/"
  | "#/components/securitySchemes/"
  | "#/components/links/"
  | "#/components/callbacks/"
  | "#/components/pathItems/";

export interface LocalReference {
  type: "local";
  /**
   * @example #/components/schemas/Hoge -> Hoge
   */
  name: string;
  /**
   * startsWith `components`
   * components/headers/hoge/fuga
   */
  path: string;
}

export interface RemoteReference {
  type: "remote";
  /**
   * file path
   */
  referencePoint: string;
  /**
   * startsWith `components`
   * components/headers/hoge/fuga
   */
  path: string;
  /**
   * From filename - extension
   * @example a/b/c/Hoge.yml -> Hoge
   */
  name: string;
  /**
   * If "componentName" exists, you can create an alias for the type.
   * If it does not exist, you need to define the type directly.
   */
  componentName?: "schemas" | "headers" | "responses" | "parameters" | "requestBodies" | "securitySchemes" | "pathItems";
}

export class Locator {
  private readonly localRefMap = {
    "#/components/schemas/": "components/schemas",
    "#/components/responses/": "components/responses",
    "#/components/parameters/": "components/parameters",
    "#/components/examples/": "components/examples",
    "#/components/requestBodies/": "components/requestBodies",
    "#/components/headers/": "components/headers",
    "#/components/securitySchemes/": "components/securitySchemes",
    "#/components/links/": "components/links",
    "#/components/callbacks/": "components/callbacks",
    "#/components/pathItems/": "components/pathItems",
  } as const;

  private readonly localReferencePatterns: LocalReferencePattern[] = [
    "#/components/schemas/",
    "#/components/responses/",
    "#/components/parameters/",
    "#/components/examples/",
    "#/components/requestBodies/",
    "#/components/headers/",
    "#/components/securitySchemes/",
    "#/components/links/",
    "#/components/callbacks/",
    "#/components/pathItems/",
  ];

  constructor(private readonly params: InitializeParams) {}

  private generateReferencePoint(currentPoint: string, reference: OpenApi.Reference): string {
    const basedir = path.dirname(currentPoint);
    const ref = reference.$ref;
    const referencePoint = path.join(basedir, ref);
    return referencePoint;
  }

  private generateRemoteReference(referencePoint: string): RemoteReference {
    const relativePathFromEntryPoint = path.relative(path.dirname(this.params.entryPoint), referencePoint); // components/hoge/fuga.yml
    const ext = path.extname(relativePathFromEntryPoint); // .yml
    const pathArray: string[] = relativePathFromEntryPoint.replace(ext, "").split(path.sep); // ["components", "hoge", "fuga"]
    const targetPath: string = pathArray.join("/"); // components/hoge/fuga
    const schemaName = pathArray[pathArray.length - 1]; // fuga
    const componentName = pathArray[0] === "components" ? pathArray[1] : "";

    if (!targetPath.startsWith("components")) {
      throw new Error(`TargetPath is not start "components":\n${targetPath}`);
    }
    return {
      type: "remote",
      referencePoint,
      path: targetPath,
      name: schemaName,
      componentName: ["schemas", "headers", "responses", "parameters", "requestBodies", "securitySchemes", "pathItems"].includes(componentName)
        ? (componentName as RemoteReference["componentName"])
        : undefined,
    };
  }

  private generateLocalReference(ref: string): LocalReference | undefined {
    const localReferencePattern = this.getLocalReference(ref);
    if (!localReferencePattern) {
      return;
    }
    const name = ref.split(localReferencePattern)[1];
    const localPath = path.join(this.localRefMap[localReferencePattern], name);
    if (!localPath.startsWith("components")) {
      throw new Error(`LocalPath is not start "components":\n${localPath}`);
    }
    return {
      type: "local",
      name: name,
      path: localPath,
    };
  }

  private getLocalReference(ref: string): LocalReferencePattern | undefined {
    let localReferencePattern: LocalReferencePattern | undefined;
    this.localReferencePatterns.forEach(referencePattern => {
      if (new RegExp("^" + referencePattern).test(ref)) {
        localReferencePattern = referencePattern;
      }
    });
    return localReferencePattern;
  }

  public search(currentPoint: string, schema: OpenApi.Reference): LocalReference | RemoteReference {
    const localReference = this.generateLocalReference(schema.$ref);
    if (localReference) {
      return localReference;
    }
    const referencePoint = this.generateReferencePoint(currentPoint, schema);
    return this.generateRemoteReference(referencePoint);
  }
}
