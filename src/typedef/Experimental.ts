import type * as OpenApi from "./OpenApi";

export interface Responses {
  [statusCode: string]: OpenApi.Response;
}

/**
 * **Warning**
 * This interface is subject to change.
 * If this is a useful interface, please provide feedback and tell us your use case.
 * 
 * @see https://github.com/Himenon/openapi-typescript-code-generator/issues/36
 */
export interface OpenApiOperation {
  httpMethod: string;
  requestUri: string;
  comment: string | undefined;
  deprecated: boolean;
  requestBody?: OpenApi.RequestBody;
  parameters?: OpenApi.Parameter[];
  responses: Responses;
}
