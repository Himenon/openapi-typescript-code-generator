import * as path from "path";

import { FeatureDevelopmentError, NotFoundFileError } from "../../Exception";
import { fileSystem } from "../../FileSystem";
import * as Logger from "../../Logger";
import { isReference } from "./Guard";
import * as Guard from "./Guard";
import { Def } from "./store";
import { OpenApi } from "./types";

export type LocalReferencePattern =
  | "#/components/schemas/"
  | "#/components/responses/"
  | "#/components/parameters/"
  // | "#/components/examples/"
  | "#/components/requestBodies/"
  | "#/components/headers/"
  | "#/components/securitySchemes/"
  // | "#/components/links/"
  // | "#/components/callbacks/"
  | "#/components/pathItems/";

export interface LocalReference {
  type: "local";
  name: string;
  /**
   * components/headers/hoge/fuga
   */
  path: string;
}

export interface RemoteReference<T> {
  type: "remote";
  referencePoint: string;
  /**
   * /components/headers/hoge/fuga
   */
  path: string;
  componentName?: Def.ComponentName;
  name: string;
  data: T;
}

export type Type<T> = LocalReference | RemoteReference<T>;

const localReferencePatterns: readonly LocalReferencePattern[] = [
  "#/components/schemas/",
  "#/components/responses/",
  "#/components/parameters/",
  // "#/components/examples/",
  "#/components/requestBodies/",
  "#/components/headers/",
  "#/components/securitySchemes/",
  // "#/components/links/",
  // "#/components/callbacks/",
  "#/components/pathItems/",
];

export const localReferenceComponents: { readonly [aliasKey in LocalReferencePattern]: string } = {
  "#/components/schemas/": "components/schemas",
  "#/components/responses/": "components/responses",
  "#/components/parameters/": "components/parameters",
  // "#/components/examples/": "components/examples",
  "#/components/requestBodies/": "components/requestBodies",
  "#/components/headers/": "components/headers",
  "#/components/securitySchemes/": "components/securitySchemes",
  // "#/components/links/": "components/links",
  // "#/components/callbacks/": "components/callbacks",
  "#/components/pathItems/": "components/pathItems",
};

export const generateLocalReference = (reference: OpenApi.Reference): LocalReference | undefined => {
  let localReferencePattern: LocalReferencePattern | undefined;
  localReferencePatterns.forEach(referencePattern => {
    if (new RegExp("^" + referencePattern).test(reference.$ref)) {
      localReferencePattern = referencePattern;
    }
  });

  if (!localReferencePattern) {
    return;
  }
  const name = reference.$ref.split(localReferencePattern)[1];
  return {
    type: "local",
    name,
    path: [localReferenceComponents[localReferencePattern], name].join("/"),
  };
};

export const generateReferencePoint = (currentPoint: string, reference: OpenApi.Reference): string => {
  const basedir = path.dirname(currentPoint);
  const ref = reference.$ref;
  return path.join(basedir, ref);
};

export const generate = <T>(entryPoint: string, currentPoint: string, reference: OpenApi.Reference): Type<T> => {
  const localReference = generateLocalReference(reference);
  if (localReference) {
    return localReference;
  }

  if (reference.$ref.startsWith("http")) {
    throw new FeatureDevelopmentError("Please Pull Request ! Welcome !");
  }

  const referencePoint = generateReferencePoint(currentPoint, reference);

  if (!fileSystem.existSync(referencePoint)) {
    Logger.showFilePosition(entryPoint, currentPoint, referencePoint);
    Logger.error(JSON.stringify(reference, null, 2));
    throw new NotFoundFileError(`Not found reference point from current point. \n Path: ${referencePoint}`);
  }

  const relativePathFromEntryPoint = path.relative(path.dirname(entryPoint), referencePoint); // components/hoge/fuga.yml
  const ext = path.extname(relativePathFromEntryPoint); // .yml
  const pathArray: string[] = relativePathFromEntryPoint.replace(ext, "").split("/"); // ["components", "hoge", "fuga"]
  const targetPath: string = pathArray.join("/"); // components/hoge/fuga
  const schemaName = pathArray[pathArray.length - 1]; // fuga
  const componentName = pathArray[0] === "components" ? pathArray[1] : "";
  const data = fileSystem.loadJsonOrYaml(referencePoint);

  if (isReference(data)) {
    return generate<T>(entryPoint, referencePoint, data);
  }

  return {
    type: "remote",
    referencePoint,
    path: targetPath,
    name: schemaName,
    componentName: Guard.isComponentName(componentName) ? componentName : undefined,
    data,
  };
};
