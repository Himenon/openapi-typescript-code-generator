import * as path from "path";
import { NotFoundFileError, FeatureDevelopmentError } from "../../Exception";
import * as Logger from "../../Logger";
import { OpenApi } from "./types";
import { isReference } from "./Guard";
import { State } from "./store";
import { fileSystem } from "../../FileSystem";

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
  target: State.ComponentName;
}

export interface RemoteReference<T> {
  type: "remote";
  referencePoint: string;
  key: string | undefined;
  keys: string[];
  target: State.ComponentName | undefined;
  data: T;
}

export type ReferenceType<T> = LocalReference | RemoteReference<T>;

const relativePathMap: { [key: string]: State.ComponentName } = {
  "components/schemas/": "schemas",
  "components/responses/": "responses",
  "components/parameters/": "parameters",
  // "components/examples/": "examples",
  "components/requestBodies/": "requestBodies",
  "components/headers/": "headers",
  "components/securitySchemes/": "securitySchemes",
  // "components/links/": "links",
  // "components/callbacks/": "callbacks",
  "components/pathItems/": "pathItems",
};

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

export const localReferenceComponents: { readonly [aliasKey in LocalReferencePattern]: State.ComponentName } = {
  "#/components/schemas/": "schemas",
  "#/components/responses/": "responses",
  "#/components/parameters/": "parameters",
  // "#/components/examples/": "examples",
  "#/components/requestBodies/": "requestBodies",
  "#/components/headers/": "headers",
  "#/components/securitySchemes/": "securitySchemes",
  // "#/components/links/": "links",
  // "#/components/callbacks/": "callbacks",
  "#/components/pathItems/": "pathItems",
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
    target: localReferenceComponents[localReferencePattern],
  };
};

export const generateReferencePoint = (currentPoint: string, reference: OpenApi.Reference): string => {
  const basedir = path.dirname(currentPoint);
  const ref = reference.$ref;
  return path.join(basedir, ref);
};

export const generate = <T>(entryPoint: string, currentPoint: string, reference: OpenApi.Reference): ReferenceType<T> => {
  const ref = reference.$ref;
  const localReference = generateLocalReference(reference);
  if (localReference) {
    return localReference;
  }

  if (ref.startsWith("http")) {
    throw new FeatureDevelopmentError("Please Pull Request ! Welcome !");
  }

  const referencePoint = generateReferencePoint(currentPoint, reference);

  if (!fileSystem.existSync(referencePoint)) {
    Logger.showFilePosition(entryPoint, currentPoint, referencePoint);
    Logger.error(JSON.stringify(reference, null, 2));
    throw new NotFoundFileError(`Not found reference point from current point. \n Path: ${referencePoint}`);
  }

  const ext = path.extname(referencePoint);
  const relativePathFromEntryPoint = path.relative(path.dirname(entryPoint), referencePoint);
  const keys: string[] = relativePathFromEntryPoint.replace(ext, "").split("/");

  let target: State.ComponentName | undefined;
  Object.keys(relativePathMap).forEach(relativePath => {
    if (new RegExp(relativePath).test(relativePathFromEntryPoint)) {
      target = relativePathMap[relativePath];
    }
  });

  const data = fileSystem.loadJsonOrYaml(referencePoint);
  if (isReference(data)) {
    return generate<T>(entryPoint, referencePoint, data);
  }

  const oneLevel = keys[0] === "components" && State.componentNames.some(componentName => componentName === keys[1]) && keys.length === 3;

  return {
    type: "remote",
    key: oneLevel ? keys[2] : undefined,
    keys,
    referencePoint,
    target,
    data,
  };
};
