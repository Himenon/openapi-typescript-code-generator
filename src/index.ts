import { OpenApi } from "./OpenApiParser";
import * as TypeScriptCodeGenerator from "./TypeScriptCodeGenerator";
import * as Converter from "./Converter";

export const generateTypeScriptCode = (entryPoint: string, openapi: OpenApi.OpenApi310): string => {
  return TypeScriptCodeGenerator.generate(Converter.create(entryPoint, openapi));
};
