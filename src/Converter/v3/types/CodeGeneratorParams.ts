import * as OpenApi from "./OpenApiSchemaV3";

export type PickedParameter = Pick<OpenApi.Parameter, "name" | "in" | "required" | "style" | "explode">;

export interface CodeGeneratorParams {
  operationId: string;
  httpMethod: string;
  requestUri: string;
  functionName: string;
  comment: string | undefined;
  deprecated: boolean;
  argumentParamsTypeDeclaration: string;
  pickedParameters: PickedParameter[];
  // Request Content Types
  requestContentTypes: string[];
  requestFirstContentType: string | undefined; // requestContentTypes.length === 1 only
  hasOver2RequestContentTypes: boolean; // requestContentTypes.length > 1
  // Response Success Name
  responseSuccessNames: string[];
  responseFirstSuccessName: string | undefined; // responseSuccessNames.length === 1 only
  hasOver2SuccessNames: boolean; // responseSuccessNames.length > 1
  // Response Success Content Type
  responseSuccessContentTypes: string[];
  responseFirstSuccessContentType: string | undefined; // responseSuccessContentTypes.length === 1
  hasOver2SuccessResponseContentTypes: boolean; // successResponseContentTypes.length > 1
  //
  hasAdditionalHeaders: boolean; // hasOver2RequestContentTypes || hasOver2SuccessResponseContentTypes
  hasQueryParameters: boolean;
  // Arguments
  hasParameter: boolean;
  hasRequestBody: boolean;
}
