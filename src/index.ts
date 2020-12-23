import { OpenApi } from "./OpenApiParser";
import * as TypeScriptCodeGenerator from "./TypeScriptCodeGenerator";
import * as Converter from "./Converter";

export const generateTypeScriptCode = (openapi: OpenApi.OpenApi310) => {
  console.info("DEBUG 中");
  console.log({
    Loaded: openapi,
  });
  return TypeScriptCodeGenerator.generate(Converter.create(openapi));
};
