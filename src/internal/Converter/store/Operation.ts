import { EOL } from "os";

import { DevelopmentError } from "../../Exception";
import { OpenApi } from "../types";

const httpMethodList = ["get", "put", "post", "delete", "options", "head", "patch", "trace"] as const;

export interface Responses {
  [statusCode: string]: OpenApi.Response;
}

export interface State {
  [operationId: string]: {
    httpMethod: string;
    requestUri: string;
    comment: string | undefined;
    deprecated: boolean;
    requestBody?: OpenApi.RequestBody;
    parameters?: OpenApi.Parameter[];
    responses: Responses;
  };
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
      state[operation.operationId] = {
        httpMethod,
        requestUri,
        comment: [operation.summary, operation.description].filter(Boolean).join(EOL),
        deprecated: !!operation.deprecated,
        requestBody: operation.requestBody as OpenApi.RequestBody,
        parameters: operation.parameters as OpenApi.Parameter[],
        responses: operation.responses as Responses,
      };
    });
  });
  return state;
};
