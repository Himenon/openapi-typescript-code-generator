import type * as Types from "./types";

export const generateValidRootSchema = (input: Types.OpenApi.Document): Types.OpenApi.Document => {
  if (!input.paths) {
    return input;
  }
  /** update undefined operation id */
  for (const [path, methods] of Object.entries(input.paths || {})) {
    for (const [method, operation] of Object.entries(methods || {})) {
      if (!operation.operationId) {
        operation.operationId = `${method.toLowerCase()}${path.charAt(0).toUpperCase() + path.slice(1)}`;
      }
    }
  }
  return input;
};
