import { EOL } from "os";

import type { CodeGenerator, OpenApi } from "../../../types";

const httpMethodList = ["get", "put", "post", "delete", "options", "head", "patch", "trace"] as const;

export interface State {
  [operationId: string]: CodeGenerator.OpenApiOperation;
}

export const create = (rootSchema: OpenApi.Document): State => {
  const paths = rootSchema.paths || {};
  const state: State = {};
  Object.entries(paths).forEach(([requestUri, pathItem]) => {
    httpMethodList.forEach(httpMethod => {
      const operation = pathItem[httpMethod];
      if (!operation) {
        return;
      }
      if (!operation.operationId) {
        return;
      }
      const parameters = [...pathItem.parameters || [], ...operation.parameters || []];
      state[operation.operationId] = {
        httpMethod,
        requestUri,
        comment: [operation.summary, operation.description].filter(Boolean).join(EOL),
        deprecated: !!operation.deprecated,
        requestBody: operation.requestBody as OpenApi.RequestBody,
        parameters: parameters as OpenApi.Parameter[],
        responses: operation.responses as CodeGenerator.OpenApiResponses,
      };
    });
  });
  return state;
};
