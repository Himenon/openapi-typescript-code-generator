import ts from "typescript";

import * as ConverterContext from "./ConverterContext";
import { Store } from "./store";
import type { CodeGeneratorParams, OpenApi, PickedParameter } from "./types";
import type { CodeGenerator } from "../../types";

const extractPickedParameter = (parameter: OpenApi.Parameter): PickedParameter => {
  return {
    name: parameter.name,
    in: parameter.in,
    required: parameter.required,
    style: parameter.style,
    explode: parameter.explode,
  };
};

const extractResponseNamesByStatusCode = (type: "success" | "error", responses: { [statusCode: string]: OpenApi.Response }): string[] => {
  const statusCodeList: string[] = [];
  Object.entries(responses || {}).forEach(([statusCodeLike, response]) => {
    // ContentTypeの定義が存在しない場合はstatusCodeを読み取らない
    if (Object.keys(response.content || {}).length === 0) {
      return;
    }
    if (typeof statusCodeLike === "string") {
      const statusCodeNumberValue = parseInt(statusCodeLike, 10);
      if (type === "success") {
        if (200 <= statusCodeNumberValue && statusCodeNumberValue < 300) {
          statusCodeList.push(statusCodeNumberValue.toString());
        }
      } else if (type === "error") {
        if (400 <= statusCodeNumberValue && statusCodeNumberValue < 600) {
          statusCodeList.push(statusCodeNumberValue.toString());
        }
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
  extractResponseNamesByStatusCode("success", responses).forEach(statusCode => {
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

export const generateCodeGeneratorParamsArray = (
  store: Store.Type,
  converterContext: ConverterContext.Types,
  allowOperationIds: string[] | undefined,
): CodeGeneratorParams[] => {
  const operationState = store.getNoReferenceOperationState();
  const params: CodeGeneratorParams[] = [];
  Object.entries(operationState).forEach(([operationId, item]) => {
    if (allowOperationIds && !allowOperationIds.includes(operationId)) {
      return;
    }
    const responseSuccessNames = extractResponseNamesByStatusCode("success", item.responses).map(statusCode =>
      converterContext.generateResponseName(operationId, statusCode),
    );
    const responseErrorNames = extractResponseNamesByStatusCode("error", item.responses).map(statusCode =>
      converterContext.generateResponseName(operationId, statusCode),
    );
    const requestContentTypeList = item.requestBody ? getRequestContentTypeList(item.requestBody) : [];
    const responseSuccessContentTypes = getSuccessResponseContentTypeList(item.responses);
    const hasOver2RequestContentTypes = requestContentTypeList.length > 1;
    const hasOver2SuccessNames = responseSuccessNames.length > 1;

    const formatParams: CodeGeneratorParams = {
      operationId: operationId,
      escapedOperationId: converterContext.escapeOperationIdText(operationId),
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
      responseErrorNames: responseErrorNames,
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
