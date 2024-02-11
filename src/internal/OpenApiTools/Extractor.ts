import type { CodeGenerator, OpenApi } from "../../types";
import * as ConverterContext from "./ConverterContext";
import type * as Walker from "./Walker";

const extractPickedParameter = (parameter: OpenApi.Parameter): CodeGenerator.PickedParameter => {
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
  for (const [statusCodeLike, response] of Object.entries(responses || {})) {
    const hasValidMediaType = Object.values(response.content || {}).filter(mediaType => Object.values(mediaType).length > 0).length > 0;
    // ContentTypeの定義が存在しない場合はstatusCodeを読み取らない
    if (!hasValidMediaType) {
      continue;
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
  }
  return statusCodeList;
};

const getRequestContentTypeList = (requestBody: OpenApi.RequestBody): string[] => {
  return Object.entries(requestBody.content).reduce<string[]>((list, [key, mediaType]) => {
    const hasValidContent = Object.values(mediaType).length > 0;
    if (hasValidContent) {
      return list.concat(key);
    }
    return list;
  }, []);
};

const getSuccessResponseContentTypeList = (responses: { [statusCode: string]: OpenApi.Response }): string[] => {
  const contentTypeList: string[] = [];
  for (const statusCode of extractResponseNamesByStatusCode("success", responses)) {
    const response = responses[statusCode];
    /**
     * responses:
     *   200:
     *     content:
     *       application/json: {}
     */
    for (const [key, mediaType] of Object.entries(response.content || {})) {
      if (Object.values(mediaType).length > 0) {
        contentTypeList.push(key);
      }
    }
  }
  return Array.from(new Set(contentTypeList));
};

const hasQueryParameters = (parameters?: OpenApi.Parameter[]): boolean => {
  if (!parameters) {
    return false;
  }
  return parameters.filter(parameter => parameter.in === "query").length > 0;
};

export const generateCodeGeneratorParamsArray = (
  store: Walker.Store,
  converterContext: ConverterContext.Types,
  allowOperationIds: string[] | undefined,
): CodeGenerator.Params[] => {
  const operationState = store.getNoReferenceOperationState();
  const params: CodeGenerator.Params[] = [];
  for (const [operationId, item] of Object.entries(operationState)) {
    if (allowOperationIds && !allowOperationIds.includes(operationId)) {
      continue;
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

    const convertedParams: CodeGenerator.ConvertedParams = {
      escapedOperationId: converterContext.escapeOperationIdText(operationId),
      argumentParamsTypeDeclaration: converterContext.generateArgumentParamsTypeDeclaration(operationId),
      functionName: converterContext.generateFunctionName(operationId),
      requestContentTypeName: converterContext.generateRequestContentTypeName(operationId),
      responseContentTypeName: converterContext.generateResponseContentTypeName(operationId),
      parameterName: converterContext.generateParameterName(operationId),
      requestBodyName: converterContext.generateRequestBodyName(operationId),
      hasRequestBody: !!item.requestBody,
      hasParameter: item.parameters ? item.parameters.length > 0 : false,
      pickedParameters: item.parameters ? item.parameters.map(extractPickedParameter) : [],
      requestContentTypes: requestContentTypeList,
      requestFirstContentType: requestContentTypeList.length === 1 ? requestContentTypeList[0] : undefined,
      responseSuccessNames: responseSuccessNames,
      responseFirstSuccessName: responseSuccessNames.length === 1 ? responseSuccessNames[0] : undefined,
      has2OrMoreSuccessNames: hasOver2SuccessNames,
      responseErrorNames: responseErrorNames,
      has2OrMoreRequestContentTypes: hasOver2RequestContentTypes,
      successResponseContentTypes: responseSuccessContentTypes,
      successResponseFirstContentType: responseSuccessContentTypes.length === 1 ? responseSuccessContentTypes[0] : undefined,
      has2OrMoreSuccessResponseContentTypes: responseSuccessContentTypes.length > 1,
      hasAdditionalHeaders: hasOver2RequestContentTypes || hasOver2SuccessNames,
      hasQueryParameters: hasQueryParameters(item.parameters),
    };

    const formatParams: CodeGenerator.Params = {
      operationId: operationId,
      convertedParams,
      operationParams: item,
    };
    params.push(formatParams);
  }

  return params;
};
