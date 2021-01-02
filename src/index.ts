import { EOL } from "os";

import * as Converter from "./Converter";
import { fileSystem } from "./FileSystem";
import * as TypeScriptCodeGenerator from "./TypeScriptCodeGenerator";

export interface Params {
  version: "v3";
  entryPoint: string;
}

export const generateTypeScriptCode = ({ version, entryPoint }: Params): string => {
  const schema = fileSystem.loadJsonOrYaml(entryPoint);
  switch (version) {
    case "v3": {
      const { createFunction, generateLeadingComment } = Converter.v3.create(entryPoint, schema);
      return [generateLeadingComment(), TypeScriptCodeGenerator.generate(createFunction)].join(EOL + EOL + EOL);
    }
    default:
      return "unSupport version";
  }
};
