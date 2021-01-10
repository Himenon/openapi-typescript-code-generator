import { EOL } from "os";

import * as TypeScriptCodeGenerator from "./CodeGenerator";
import * as Converter from "./Converter";
import { fileSystem } from "./FileSystem";

export interface Params {
  version: "v3";
  entryPoint: string;
  option?: Converter.v3.Option;
}

export const generateTypeScriptCode = ({ version, entryPoint, option }: Params): string => {
  const schema = fileSystem.loadJsonOrYaml(entryPoint);
  switch (version) {
    case "v3": {
      const { createFunction, generateLeadingComment } = Converter.v3.create(entryPoint, schema, option || {});
      return [generateLeadingComment(), TypeScriptCodeGenerator.generate(createFunction)].join(EOL + EOL + EOL);
    }
    default:
      return "UnSupport OpenAPI Version";
  }
};
