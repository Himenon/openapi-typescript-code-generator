export interface MethodBodyParams {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required: boolean;
  style?: "matrix" | "label" | "form" | "simple" | "spaceDelimited" | "pipeDelimited" | "deepObject";
  explode?: string;
}

export interface MethodParams {
  operationId: string;
  httpMethod: string;
  requestUri: string;
  functionName: string;
  argumentParamsTypeDeclaration: string;
  successResponseNameList: string[];
  requestParameterCategories: MethodBodyParams[];
  requestContentTypeList: string[];
  successResponseContentTypeList: string[];
  hasParameter: boolean;
  hasRequestBody: boolean;
}
