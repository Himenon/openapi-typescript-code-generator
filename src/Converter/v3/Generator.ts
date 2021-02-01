import ts from "typescript";

import * as ConverterContext from "./ConverterContext";
import { Store } from "./store";
import { CodeGeneratorParams, OpenApi, PickedParameter } from "./types";

const extractPickedParameter = (parameter: OpenApi.Parameter): PickedParameter => {
  return {
    name: parameter.name,
    in: parameter.in,
    required: parameter.required,
    style: parameter.style,
    explode: parameter.explode,
  };
};

const extractSuccessStatusCode = (responses: { [statusCode: string]: OpenApi.Response }): string[] => {
  const statusCodeList: string[] = [];
  Object.entries(responses || {}).forEach(([statusCodeLike, response]) => {
    // ContentTypeの定義が存在しない場合はstatusCodeを読み取らない
    if (Object.keys(response.content || {}).length === 0) {
      return;
    }
    if (typeof statusCodeLike === "string") {
      const statusCodeNumberValue = parseInt(statusCodeLike, 10);
      if (200 <= statusCodeNumberValue && statusCodeNumberValue < 300) {
        statusCodeList.push(statusCodeNumberValue.toString());
      }
    }
  });
  return statusCodeList;
};

const getRequestContentTypeList = (requestBody: OpenApi.RequestBody): string[] => {
  return Object.keys(requestBody.content);
};

const getSuccessResponseContentTypeList = (responses: { [statusCode: string]: OpenApi.Response }): string[] => {
  let contentTypeList: string[] = [];
  extractSuccessStatusCode(responses).forEach(statusCode => {
    const response = responses[statusCode];
    contentTypeList = contentTypeList.concat(Object.keys(response.content || {}));
  });
  return Array.from(new Set(contentTypeList));
};

const hasQueryParameters = (parameters?: OpenApi.Parameter[]): boolean => {
  if (!parameters) {
    return false;
  }
  return parameters.filter(parameter => parameter.in === "query").length > 0;
};

const generateCodeGeneratorParamsList = (store: Store.Type, converterContext: ConverterContext.Types): CodeGeneratorParams[] => {
  const operationState = store.getNoReferenceOperationState();
  const params: CodeGeneratorParams[] = [];
  Object.entries(operationState).forEach(([operationId, item]) => {
    const responseSuccessNames = extractSuccessStatusCode(item.responses).map(statusCode =>
      converterContext.generateResponseName(operationId, statusCode),
    );
    const requestContentTypeList = item.requestBody ? getRequestContentTypeList(item.requestBody) : [];
    const responseSuccessContentTypes = getSuccessResponseContentTypeList(item.responses);
    const hasOver2RequestContentTypes = requestContentTypeList.length > 1;
    const hasOver2SuccessNames = responseSuccessNames.length > 1;

    const formatParams: CodeGeneratorParams = {
      operationId: operationId,
      rawRequestUri: item.requestUri,
      httpMethod: item.httpMethod,
      argumentParamsTypeDeclaration: converterContext.generateArgumentParamsTypeDeclaration(operationId),
      // function
      functionName: converterContext.generateFunctionName(operationId),
      comment: item.comment,
      deprecated: item.deprecated,
      requestContentTypeName: converterContext.generateRequestContentTypeName(operationId),
      responseContentTypeName: converterContext.generateResponseContentTypeName(operationId),
      parameterName: converterContext.generateParameterName(operationId),
      requestBodyName: converterContext.generateRequestBodyName(operationId),
      //
      hasRequestBody: !!item.requestBody,
      hasParameter: item.parameters ? item.parameters.length > 0 : false,
      pickedParameters: item.parameters ? item.parameters.map(extractPickedParameter) : [],
      // Request Content Types
      requestContentTypes: requestContentTypeList,
      requestFirstContentType: requestContentTypeList.length === 1 ? requestContentTypeList[0] : undefined,
      has2OrMoreRequestContentTypes: hasOver2RequestContentTypes,
      // Response Success Name
      responseSuccessNames: responseSuccessNames,
      responseFirstSuccessName: responseSuccessNames.length === 1 ? responseSuccessNames[0] : undefined,
      has2OrMoreSuccessNames: hasOver2SuccessNames,
      // Response Success Content Type
      successResponseContentTypes: responseSuccessContentTypes,
      successResponseFirstContentType: responseSuccessContentTypes.length === 1 ? responseSuccessContentTypes[0] : undefined,
      has2OrMoreSuccessResponseContentTypes: responseSuccessContentTypes.length > 1,
      //
      hasAdditionalHeaders: hasOver2RequestContentTypes || hasOver2SuccessNames,
      hasQueryParameters: hasQueryParameters(item.parameters),
      // Response Success Name
    };
    params.push(formatParams);
  });

  return params;
};

export type RewriteCodeAfterTypeDeclaration = (
  context: ts.TransformationContext,
  codeGeneratorParamsList: CodeGeneratorParams[],
) => ts.Statement[];

export const generateApiClientCode = (
  store: Store.Type,
  context: ts.TransformationContext,
  converterContext: ConverterContext.Types,
  rewriteCodeAfterTypeDeclaration: RewriteCodeAfterTypeDeclaration,
): void => {
  const codeGeneratorParamsList = generateCodeGeneratorParamsList(store, converterContext);
  store.addAdditionalStatement(rewriteCodeAfterTypeDeclaration(context, codeGeneratorParamsList));
};
