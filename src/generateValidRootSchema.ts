import type * as Types from "./types";

const normalizePathParameters = (parameters: (Types.OpenApi.Parameter | Types.OpenApi.Reference)[] | undefined): void => {
  if (!parameters) {
    return;
  }
  for (const parameter of parameters) {
    if ("$ref" in parameter) {
      continue;
    }
    // OpenAPI 3.x spec §3.3.2: path パラメータは常に required: true
    if (parameter.in === "path") {
      parameter.required = true;
    }
  }
};

export const generateValidRootSchema = (input: Types.OpenApi.Document): Types.OpenApi.Document => {
  if (input.components?.parameters) {
    normalizePathParameters(Object.values(input.components.parameters));
  }

  if (!input.paths) {
    return input;
  }

  const httpMethods = ["get", "put", "post", "delete", "options", "head", "patch", "trace"] as const;

  for (const [path, pathItem] of Object.entries(input.paths)) {
    normalizePathParameters(pathItem.parameters);

    for (const method of httpMethods) {
      const operation = pathItem[method];
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
      normalizePathParameters(operation.parameters);
    }
  }

  return input;
};
