import * as path from "path";
import { NotFoundFileError, FeatureDevelopmentError } from "../../Exception";
import * as Logger from "../../Logger";
import { OpenApi } from "./types";
import { isReference } from "./Guard";
import { State } from "./store";
import { fileSystem } from "../../FileSystem";

export type AliasReference<T> = InternalAliasReference | ExternalAliasReference<T>;

export type AliasPattern =
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

export interface InternalAliasReference {
  internal: true;
  name: string;
  target: State.ComponentName;
}

export interface ExternalAliasReference<T> {
  internal: false;
  referencePoint: string;
  name: string[];
  data: T;
}

const aliasPatterns: readonly AliasPattern[] = [
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

export const aliasComponents: { readonly [aliasKey in AliasPattern]: State.ComponentName } = {
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

export const generateInternalAliasReference = (reference: OpenApi.Reference): InternalAliasReference | undefined => {
  let aliasKey: AliasPattern | undefined;
  aliasPatterns.forEach(aliasPattern => {
    if (new RegExp("^" + aliasPattern).test(reference.$ref)) {
      aliasKey = aliasPattern;
    }
  });

  if (!aliasKey) {
    return;
  }
  const name = reference.$ref.split(aliasKey)[1];
  return {
    internal: true,
    name,
    target: aliasComponents[aliasKey],
  };
};

export const generateReferencePoint = (currentPoint: string, reference: OpenApi.Reference): string => {
  const basedir = path.dirname(currentPoint);
  const ref = reference.$ref;
  return path.join(basedir, ref);
};

/**
 * TODO Validation
 */
export const generate = <T>(entryPoint: string, currentPoint: string, reference: OpenApi.Reference): AliasReference<T> => {
  const ref = reference.$ref;
  const internalAliasReference = generateInternalAliasReference(reference);
  if (internalAliasReference) {
    return internalAliasReference;
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
  const name = relativePathFromEntryPoint.replace(ext, "").split("/");

  return {
    internal: false,
    name,
    referencePoint,
    data: fileSystem.loadJsonOrYaml(referencePoint),
  };
};

export const resolve = (entryFilename: string, referenceFilename: string, reference: OpenApi.Reference): OpenApi.Schema | string => {
  const alias = generate<OpenApi.Schema | OpenApi.Reference>(entryFilename, referenceFilename, reference);
  if (alias.internal) {
    return alias.name;
  }
  if (isReference(alias.data)) {
    return resolve(entryFilename, alias.referencePoint, alias.data);
  }
  return alias.data;
};