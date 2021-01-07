import ts from "typescript";

import { Factory } from "../../TypeScriptCodeGenerator";
import * as Name from "./Name";
import { Store } from "./store";
import * as Templates from "./templates";
import { OpenApi } from "./types";

const convertParameterToRequestParameterCategory = (parameter: OpenApi.Parameter): Templates.ApiClientClass.Method.MethodBody.Param => {
  return {
    name: parameter.name,
    in: parameter.in,
    required: parameter.required,
    style: parameter.style,
  };
};

const getSuccessStatusCodes = (responses: { [statusCode: string]: OpenApi.Response }): string[] => {
  const statusCodeList: string[] = [];
  Object.keys(responses || {}).forEach(statusCodeLike => {
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
  return contentTypeList;
};

const generateParams = (store: Store.Type): Templates.ApiClientClass.Params[] => {
  const operationState = store.getNoReferenceOperationState();
  const params: Templates.ApiClientClass.Params[] = [];
  Object.entries(operationState).forEach(([operationId, value]) => {
    const item: Templates.ApiClientClass.Params = {
      operationId: operationId,
      requestUri: value.requestUri,
      httpMethod: value.httpMethod,
      successResponseNameList: getSuccessStatusCodes(value.responses).map(statusCode => Name.responseName(operationId, statusCode)),
      argumentParamsTypeDeclaration: Name.argumentParamsTypeDeclaration(operationId),
      functionName: operationId,
      hasRequestBody: !!value.requestBody,
      hasParameter: value.parameters ? value.parameters.length > 0 : false,
      requestParameterCategories: value.parameters ? value.parameters.map(convertParameterToRequestParameterCategory) : [],
      requestContentTypeList: value.requestBody ? getRequestContentTypeList(value.requestBody) : [],
      successResponseContentTypeList: getSuccessResponseContentTypeList(value.responses),
    };
    params.push(item);
  });

  console.log(params);
  return params;
};

export const generateApiClientCode = (store: Store.Type, factory: Factory.Type): void => {
  const list = generateParams(store);
  const statements: ts.Statement[] = [];
  list.forEach(params => {
    if (params.hasRequestBody) {
      statements.push(Templates.ApiClientArgument.createRequestContentTypeReference(factory, params.operationId));
    }
    statements.push(
      Templates.ApiClientArgument.create(factory, {
        name: params.argumentParamsTypeDeclaration,
        operationId: params.operationId,
        hasParameter: params.hasParameter,
        hasRequestBody: params.hasRequestBody,
      }),
    );
  });
  Templates.ApiClientClass.create(factory, list).forEach(newStatement => {
    statements.push(newStatement);
  });

  store.addAdditionalStatement(statements);
  store.dumpOperationState("debug/state.json");
};
