import { OpenApi } from "./OpenApiParser";
import * as TypeScriptCodeGenerator from "./TypeScriptCodeGenerator";
import * as Converter from "./Converter";

export const generateTypeScriptCode = (entryFilename: string, openapi: OpenApi.OpenApi310): string => {
  return TypeScriptCodeGenerator.generate(Converter.create(entryFilename, openapi));
};
