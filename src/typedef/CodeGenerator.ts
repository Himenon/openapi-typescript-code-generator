import type ts from "typescript";

import type * as OpenApi from "./OpenApi";

export type PickedParameter = Pick<OpenApi.Parameter, "name" | "in" | "required" | "style" | "explode">;

export interface OpenApiResponses {
  [statusCode: string]: OpenApi.Response;
}

export interface OpenApiOperation {
  httpMethod: string;
  requestUri: string;
  comment: string | undefined;
  deprecated: boolean;
  requestBody?: OpenApi.RequestBody;
  parameters?: OpenApi.Parameter[];
  responses: OpenApiResponses;
}

export interface ConvertedParams {
  escapedOperationId: string;
  argumentParamsTypeDeclaration: string;
  functionName: string;
  requestContentTypeName: string;
  responseContentTypeName: string;
  parameterName: string;
  pickedParameters: PickedParameter[];
  requestBodyName: string; // `RequestBody$${operationId}`
  // Request Content Types
  requestContentTypes: string[];
  requestFirstContentType: string | undefined; // requestContentTypes.length === 1 only
  has2OrMoreRequestContentTypes: boolean; // requestContentTypes.length > 1
  // Response Error Response Name
  responseErrorNames: string[];
  // Response Success Name
  responseSuccessNames: string[]; // `Response$${operationId}$Status$${statusCode}`[]
  responseFirstSuccessName: string | undefined; // responseSuccessNames.length === 1 only
  has2OrMoreSuccessNames: boolean; // responseSuccessNames.length > 1
  successResponseContentTypes: string[]; // response.content[statusCode][contentType] ( 200 <= statusCode < 300 )
  successResponseFirstContentType: string | undefined; // successResponseContentTypes.length === 1
  has2OrMoreSuccessResponseContentTypes: boolean; // successResponseContentTypes.length > 1
  hasAdditionalHeaders: boolean; // has2OrMoreRequestContentTypes || has2OrMoreSuccessResponseContentTypes
  hasQueryParameters: boolean; // parameters.in === "query" && parameters.length > 0
  // Arguments
  hasParameter: boolean;
  hasRequestBody: boolean;
}

export interface Params {
  operationId: string;
  convertedParams: ConvertedParams;
  operationParams: OpenApiOperation;
}

/**
 * Used to further transform the code created by the specified Generator Template.
 */
export type IntermediateCode = string | ts.Statement;

export type GenerateFunction<Option = {}> = (payload: Params[], option?: Option) => IntermediateCode[];

export interface OutputConfiguration {
  /**
   *
   */
  transform?: (params: IntermediateCode) => IntermediateCode[];
}

export interface CustomGenerator<T> {
  generator: GenerateFunction<T>;
  option?: T;
}
