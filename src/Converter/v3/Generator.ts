import ts from "typescript";

import { Factory } from "../../TypeScriptCodeGenerator";
import { Store } from "./store";
import * as Templates from "./templates";
import { OpenApi } from "./types";

const OPERATIONS: (keyof OpenApi.PathItem)[] = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

type Params = Templates.ApiClientClass.Params;

const convertParameterToRequestParameterCategory = (parameter: OpenApi.Parameter): Templates.ApiClientClass.Method.MethodBody.Param => {
  return {
    name: parameter.name,
    in: parameter.in,
    required: parameter.required,
    style: parameter.style,
  };
};

const getSuccessStatusCodes = (operation: OpenApi.Operation): string[] => {
  const statusCodeList: string[] = [];
  Object.keys(operation.responses || {}).forEach(statusCodeLike => {
    if (typeof statusCodeLike === "string") {
      const statusCodeNumberValue = parseInt(statusCodeLike, 10);
      if (200 <= statusCodeNumberValue && statusCodeNumberValue < 300) {
        statusCodeList.push(statusCodeNumberValue.toString());
      }
    }
  });
  return statusCodeList;
};

const generateParams = (store: Store.Type, pathItem: OpenApi.PathItem): Params[] => {
  return OPERATIONS.reduce<Params[]>((previous, httpMethodName) => {
    const operation = pathItem[httpMethodName] as OpenApi.Operation;
    const operationId = operation && operation.operationId;
    if (!operationId) {
      return previous;
    }
    const state = store.getOperationState(operationId);
    // see components/responses
    const responseNames = getSuccessStatusCodes(operation).map(statusCode => `Response$${operationId}$Status$${statusCode}`);
    const requestParameterCategories = state.parameters.map(convertParameterToRequestParameterCategory);
    return previous.concat({
      httpMethod: state.httpMethod,
      operationId: operationId,
      argumentInterfaceName: `Params$${operationId}`,
      parameterName: state.parameterName,
      requestBodyName: state.requestBodyName,
      requestContentTypeList: state.requestContentTypeList,
      successResponseContentTypeList: state.successResponseContentTypeList,
      responseNames: responseNames,
      requestParameterCategories: requestParameterCategories,
      requestUri: state.requestUri,
    });
  }, []);
};

export const generateApiClientCode = (store: Store.Type, factory: Factory.Type, paths: OpenApi.Paths): void => {
  const list = Object.values(paths)
    .map(pathItem => generateParams(store, pathItem))
    .flat();
  const statements: ts.Statement[] = [];
  list.forEach(params => {
    if (params.requestBodyName) {
      statements.push(
        Templates.ApiClientArgument.createRequestContentTypeReference(factory, {
          operationId: params.operationId,
          requestBodyName: params.requestBodyName,
        }),
      );
    }
    statements.push(
      Templates.ApiClientArgument.create(factory, {
        name: params.argumentInterfaceName,
        operationId: params.operationId,
        parameterName: params.parameterName,
        requestBodyName: params.requestBodyName,
      }),
    );
  });
  Templates.ApiClientClass.create(factory, list).forEach(newStatement => {
    statements.push(newStatement);
  });

  store.addAdditionalStatement(statements);
  store.dumpOperationState("debug/state.json");
};
