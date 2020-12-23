import { OpenApi310 } from "./codegen/OpenApiSchema";

export const generateTypeScriptCode = (openapi: OpenApi310) => {
  console.info("DEBUG 中");

  openapi.components
  return JSON.stringify(openapi, null, 2);
}
