import * as fs from "fs"; // TODO 使わない
import * as path from "path";
import { UnSupportError, NotFoundFileError } from "../Exception";
import * as Logger from "../Logger";
import { OpenApi } from "../OpenApiParser";
import { isReference } from "./Guard";
import * as yaml from "js-yaml";

export interface InternalAliasReference {
  internal: true;
  name: string;
}

export interface ExternalAliasReference<T> {
  internal: false;
  referencePoint: string;
  name: string[];
  data: T;
}

export type AliasReference<T> = InternalAliasReference | ExternalAliasReference<T>;

const aliasPatterns = [
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

/**
 * TODO Validation
 */
export const generate = <T>(entryPoint: string, currentPoint: string, reference: OpenApi.Reference): AliasReference<T> => {
  const ref = reference.$ref;

  let matchPattern: string | undefined;
  aliasPatterns.forEach(aliasPattern => {
    if (new RegExp("^" + aliasPattern).test(ref)) {
      matchPattern = aliasPattern;
    }
  });

  if (matchPattern) {
    const name = ref.split(matchPattern)[1];
    return {
      internal: true,
      name,
    };
  }

  if (ref.startsWith("http")) {
    throw new UnSupportError("Please Pull Request ! Welcome !");
  }

  const basedir = path.dirname(currentPoint);
  const referencePoint = path.join(basedir, ref);

  const existFile = fs.existsSync(referencePoint) && fs.statSync(referencePoint).isFile();
  if (!existFile) {
    Logger.error("");
    Logger.error(`CurrentPoint   : "${currentPoint}"`);
    Logger.error(`ReferencePoint : "${referencePoint}"`);
    Logger.error("");
    throw new NotFoundFileError("Not found reference point from current point.");
  }

  const ext = path.extname(referencePoint);
  const relativePathFromEntryPoint = path.relative(path.dirname(entryPoint), referencePoint);
  const name = relativePathFromEntryPoint.replace(ext, "").split("/");

  const data = fs.readFileSync(referencePoint, { encoding: "utf-8" });

  if (ext === ".json") {
    return {
      internal: false,
      name,
      referencePoint: referencePoint,
      data: JSON.parse(data),
    };
  }

  if (ext === ".yml" || ext === ".yaml") {
    return {
      internal: false,
      name,
      referencePoint: referencePoint,
      data: yaml.safeLoad(data) as any,
    };
  }

  throw new UnSupportError(`UnSupport Extension file: ${referencePoint}`);
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
