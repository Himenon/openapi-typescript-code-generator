import * as fs from "fs"; // TODO 使わない
import * as path from "path";
import { UnSupportError, NotFoundFileError } from "../Exception";
import { OpenApi } from "../OpenApiParser";
import { isReference } from "./Guard";
import * as yaml from "js-yaml";

export interface InternalAliasReference {
  internal: true;
  name: string;
}

export interface ExternalAliasReference<T> {
  internal: false;
  referenceFilename: string;
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
export const generate = <T>(entryFilename: string, filename: string, reference: OpenApi.Reference): AliasReference<T> => {
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

  const basedir = path.dirname(filename);
  const referenceFilename = path.join(basedir, ref);

  console.log({
    entryFilename,
    filename,
    ref,
    referenceFilename,
  });

  const existFile = fs.existsSync(referenceFilename) && fs.statSync(referenceFilename).isFile();
  if (!existFile) {
    throw new NotFoundFileError(`"${filename}": $ref: "${referenceFilename}"`);
  }

  // entry filename : /some/path/index.yml
  // filename       : /some/path/index.yml
  // $ref           : ./components/fuga/hoge.yml    ----- 1 => /some/path/components/fuga/hoge.yml

  // entry filename : /some/path/index.yml
  // filename       : /some/path/components/hoge.yml
  // $ref           : ./fuga/hoge.yml               ----- 1 => /some/path/components/fuga/hoge.yml

  // ./components/
  // ./components/hoge.yml      => [components, hoge] --> export namespace Components { export interface Hoge { } };
  // ./components/fuga/hoge.yml => [components, fuga, hoge] --> export namespace Components { export namespace Fuga { export interface Hoge {} } };

  const ext = path.extname(referenceFilename);
  const relativePathFromEntryFile = path.relative(path.dirname(entryFilename), referenceFilename);
  const name = relativePathFromEntryFile.replace(ext, "").split("/");

  const data = fs.readFileSync(referenceFilename, { encoding: "utf-8" });

  if (ext === ".json") {
    return {
      internal: false,
      name,
      referenceFilename,
      data: JSON.parse(data),
    };
  }

  if (ext === ".yml" || ext === ".yaml") {
    return {
      internal: false,
      name,
      referenceFilename,
      data: yaml.safeLoad(data) as any,
    };
  }

  throw new UnSupportError(`UnSupport Extension file: ${referenceFilename}`);
};

export const resolve = (entryFilename: string, referenceFilename: string, reference: OpenApi.Reference): OpenApi.Schema | string => {
  const alias = generate<OpenApi.Schema | OpenApi.Reference>(entryFilename, referenceFilename, reference);
  if (alias.internal) {
    return alias.name;
  }
  if (isReference(alias.data)) {
    return resolve(entryFilename, alias.referenceFilename, alias.data);
  }
  return alias.data;
};
