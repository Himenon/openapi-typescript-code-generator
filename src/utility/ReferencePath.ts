import { posix as path } from "path";

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

const localReferencePatterns: LocalReferencePattern[] = [
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

const localRefMap = {
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

const getLocalReference = (ref: string): LocalReferencePattern | undefined => {
  let localReferencePattern: LocalReferencePattern | undefined;
  localReferencePatterns.forEach(referencePattern => {
    if (new RegExp("^" + referencePattern).test(ref)) {
      localReferencePattern = referencePattern;
    }
  });
  return localReferencePattern;
};

export const generateLocalReference = (ref: string): LocalReference | undefined => {
  const localReferencePattern = getLocalReference(ref);
  if (!localReferencePattern) {
    return;
  }
  const name = ref.split(localReferencePattern)[1];
  const localPath = path.join(localRefMap[localReferencePattern], name);
  if (!localPath.startsWith("components")) {
    throw new Error(`LocalPath is not start "components":\n${localPath}`);
  }
  return {
    type: "local",
    name: name,
    path: localPath,
  };
};

export const generateReferencePoint = (currentPoint: string, ref: string): string => {
  const basedir = path.dirname(currentPoint);
  const referencePoint = path.join(basedir, ref);
  return referencePoint;
};



export const normalizeLocalReferencePoint = (referencePoint: string): string => {
  return path.relative("#", referencePoint);
};

export const normalizeRemoteReferencePoint = (entryPoint: string, referencePoint: string): string => {
  return path.relative(path.dirname(entryPoint), referencePoint);
};


