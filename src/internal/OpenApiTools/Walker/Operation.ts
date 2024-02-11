import { EOL } from "os";

import type { CodeGenerator, OpenApi } from "../../../types";

const httpMethodList = ["get", "put", "post", "delete", "options", "head", "patch", "trace"] as const;

export interface State {
  [operationId: string]: CodeGenerator.OpenApiOperation;
}

type UniqueParameterMap = Record<string, OpenApi.Parameter>;

const uniqParameters = (rawParameters: OpenApi.Parameter[]): OpenApi.Parameter[] => {
  const parameterMap = rawParameters.reduce<UniqueParameterMap>((all, parameter) => {
    return { ...all, [`${parameter.in}:${parameter.name}`]: parameter };
  }, {});
  return Object.values(parameterMap);
};

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
      const parameters = [...(pathItem.parameters || []), ...(operation.parameters || [])] as OpenApi.Parameter[];

      const requestBody = operation.requestBody as OpenApi.RequestBody | undefined;
      const hasRequestBody = requestBody ? Object.values(requestBody.content).filter(Boolean).length > 0 : false;

      state[operation.operationId] = {
        httpMethod,
        requestUri,
        comment: [operation.summary, operation.description].filter(Boolean).join(EOL),
        deprecated: !!operation.deprecated,
        requestBody: hasRequestBody ? requestBody : undefined,
        parameters: uniqParameters(parameters),
        responses: operation.responses as CodeGenerator.OpenApiResponses,
      };
    });
  });
  return state;
};
