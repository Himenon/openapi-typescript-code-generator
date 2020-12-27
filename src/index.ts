import * as Converter from "./Converter";
import * as TypeScriptCodeGenerator from "./TypeScriptCodeGenerator";
import { EOL } from "os";

export interface Params {
  version: "v3";
  entryPoint: string;
  schema: Converter.v3.OpenApi.RootTypes;
}

export const generateTypeScriptCode = ({ version, entryPoint, schema }: Params): string => {
  switch (version) {
    case "v3": {
      const { createFunction, generateLeadingComment } = Converter.v3.create(entryPoint, schema);
      return [generateLeadingComment(), TypeScriptCodeGenerator.generate(createFunction)].join(EOL + EOL + EOL);
    }
    default:
      return "unSupport version";
  }
};
