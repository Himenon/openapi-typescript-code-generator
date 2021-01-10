import ts from "typescript";

import { Factory } from "../../CodeGenerator";
import * as Name from "./Name";
import { Store } from "./store";
import * as Templates from "./templates";
import { OpenApi } from "./types";

const convertParameterToRequestParameterCategory = (parameter: OpenApi.Parameter): Templates.ApiClientClass.Method.MethodBodyParams => {
  return {
    name: parameter.name,
    in: parameter.in,
    required: parameter.required,
    style: parameter.style,
    explode: parameter.explode,
  };
};

const getSuccessStatusCodes = (responses: { [statusCode: string]: OpenApi.Response }): string[] => {
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
  getSuccessStatusCodes(responses).forEach(statusCode => {
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

const generateParams = (store: Store.Type): Templates.ApiClientClass.Params[] => {
  const operationState = store.getNoReferenceOperationState();
  const params: Templates.ApiClientClass.Params[] = [];
  Object.entries(operationState).forEach(([operationId, item]) => {
    const responseSuccessNames = getSuccessStatusCodes(item.responses).map(statusCode => Name.responseName(operationId, statusCode));
    const requestContentTypeList = item.requestBody ? getRequestContentTypeList(item.requestBody) : [];
    const responseSuccessContentTypes = getSuccessResponseContentTypeList(item.responses);
    const hasOver2RequestContentTypes = requestContentTypeList.length > 1;
    const hasOver2SuccessNames = responseSuccessNames.length > 1;
    const formatParams: Templates.ApiClientClass.Params = {
      operationId: operationId,
      requestUri: item.requestUri,
      httpMethod: item.httpMethod,
      argumentParamsTypeDeclaration: Name.argumentParamsTypeDeclaration(operationId),
      // function
      functionName: operationId,
      comment: item.comment,
      deprecated: item.deprecated,
      //
      hasRequestBody: !!item.requestBody,
      hasParameter: item.parameters ? item.parameters.length > 0 : false,
      requestParameterCategories: item.parameters ? item.parameters.map(convertParameterToRequestParameterCategory) : [],
      // Request Content Types
      requestContentTypes: requestContentTypeList,
      requestFirstContentType: requestContentTypeList.length === 1 ? requestContentTypeList[0] : undefined,
      hasOver2RequestContentTypes,
      // Response Success Name
      responseSuccessNames: responseSuccessNames,
      responseFirstSuccessName: responseSuccessNames.length === 1 ? responseSuccessNames[0] : undefined,
      hasOver2SuccessNames,
      // Response Success Content Type
      responseSuccessContentTypes,
      responseFirstSuccessContentType: responseSuccessContentTypes.length === 1 ? responseSuccessContentTypes[0] : undefined,
      hasOver2SuccessResponseContentTypes: responseSuccessContentTypes.length > 1,
      //
      hasAdditionalHeaders: hasOver2RequestContentTypes || hasOver2SuccessNames,
      hasQueryParameters: hasQueryParameters(item.parameters),
      // Response Success Name
    };
    params.push(formatParams);
  });

  return params;
};

export const generateApiClientCode = (store: Store.Type, factory: Factory.Type): void => {
  const list = generateParams(store);
  const statements: ts.Statement[] = [];
  list.forEach(params => {
    if (params.hasRequestBody) {
      statements.push(Templates.ApiClientArgument.createRequestContentTypeReference(factory, params));
    }
    if (params.responseSuccessNames.length > 0) {
      statements.push(Templates.ApiClientArgument.createResponseContentTypeReference(factory, params));
    }
    const typeDeclaration = Templates.ApiClientArgument.create(factory, params);
    if (typeDeclaration) {
      statements.push(typeDeclaration);
    }
  });
  Templates.ApiClientClass.create(factory, list).forEach(newStatement => {
    statements.push(newStatement);
  });

  store.addAdditionalStatement(statements);
};
