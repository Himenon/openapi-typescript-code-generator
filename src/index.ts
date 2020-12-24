import { OpenApi } from "./OpenApiParser";
import * as TypeScriptCodeGenerator from "./TypeScriptCodeGenerator";
import * as Converter from "./Converter";
import { EOL } from "os";

export const generateTypeScriptCode = (entryPoint: string, openapi: OpenApi.OpenApi310): string => {
  const { createFunction, generateLeadingComment } = Converter.create(entryPoint, openapi);
  return [generateLeadingComment(), TypeScriptCodeGenerator.generate(createFunction)].join(EOL + EOL + EOL);
};
