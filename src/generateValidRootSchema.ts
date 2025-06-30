import type * as Types from "./types";

export const generateValidRootSchema = (input: Types.OpenApi.Document): Types.OpenApi.Document => {
  if (!input.paths) {
    return input;
  }
  /** update undefined operation id */
  for (const [path, methods] of Object.entries(input.paths || {})) {
    const targets = {
      get: methods.get,
      put: methods.put,
      post: methods.post,
      delete: methods.delete,
      options: methods.options,
      head: methods.head,
      patch: methods.patch,
      trace: methods.trace,
    } satisfies Record<string, Types.OpenApi.Operation | undefined>;
    for (const [method, operation] of Object.entries(targets)) {
      if (!operation) {
        continue;
      }
      // skip reference object
      if ("$ref" in operation) {
        continue;
      }
      if (!operation.operationId) {
        operation.operationId = `${method.toLowerCase()}${path.charAt(0).toUpperCase() + path.slice(1)}`;
      }
    }
  }
  return input;
};
