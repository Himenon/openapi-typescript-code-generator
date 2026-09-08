import type * as Types from "./types";

export const generateValidRootSchema = (input: Types.OpenApi.Document): Types.OpenApi.Document => {
  /** update undefined operation id */
  for (const [path, methods] of Object.entries(input.paths || {})) {
    if ("$ref" in methods) {
      continue;
    }
    const targets = {
      get: methods.get,
      put: methods.put,
      post: methods.post,
      delete: methods.delete,
      options: methods.options,
      head: methods.head,
      patch: methods.patch,
      trace: methods.trace,
      query: methods.query,
    } satisfies Record<string, Types.OpenApi.Operation | undefined>;
    assignOperationIds(path, targets);
    // OpenAPI 3.2 で追加された additionalOperations にも operationId を補完します。
    assignOperationIds(path, methods.additionalOperations || {});
  }
  for (const [name, pathItem] of Object.entries(input.components?.pathItems || {})) {
    if ("$ref" in pathItem) {
      continue;
    }
    const targets = {
      get: pathItem.get,
      put: pathItem.put,
      post: pathItem.post,
      delete: pathItem.delete,
      options: pathItem.options,
      head: pathItem.head,
      patch: pathItem.patch,
      trace: pathItem.trace,
      query: pathItem.query,
    } satisfies Record<string, Types.OpenApi.Operation | undefined>;
    assignOperationIds(name, targets);
    // OpenAPI 3.2 で追加された additionalOperations にも operationId を補完します。
    assignOperationIds(name, pathItem.additionalOperations || {});
  }
  return input;
};

const assignOperationIds = (path: string, operations: Record<string, Types.OpenApi.Operation | undefined>): void => {
  for (const [method, operation] of Object.entries(operations)) {
    if (!operation || "$ref" in operation || operation.operationId) {
      continue;
    }
    operation.operationId = `${method.toLowerCase()}${path.charAt(0).toUpperCase() + path.slice(1)}`;
  }
};
