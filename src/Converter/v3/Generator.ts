import ts from "typescript";

import { Factory } from "../../TypeScriptCodeGenerator";
import { Store } from "./store";
import * as Templates from "./templates";
import { OpenApi } from "./types";

const OPERATIONS: (keyof OpenApi.PathItem)[] = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

interface Params {
  methodName: string;
  argumentInterfaceName: string;
  parameterName?: string;
  requestBodyName?: string;
}

const generateParams = (store: Store.Type, pathItem: OpenApi.PathItem): Params[] => {
  return OPERATIONS.reduce<Params[]>((previous, httpMethodName) => {
    const operation = pathItem[httpMethodName] as OpenApi.Operation;
    const operationId = operation && operation.operationId;
    if (!operationId) {
      return previous;
    }
    const state = store.getOperationState(operationId);
    return previous.concat({
      methodName: operationId,
      argumentInterfaceName: `Params$${operationId}`,
      parameterName: state.parameterName,
      requestBodyName: state.requestBodyName,
    });
  }, []);
};

export const generateApiClientCode = (store: Store.Type, factory: Factory.Type, paths: OpenApi.Paths): void => {
  const list = Object.values(paths)
    .map(pathItem => generateParams(store, pathItem))
    .flat();
  const statements: ts.Statement[] = list.map(params => {
    return Templates.ApiClientArgument.create(factory, {
      name: params.argumentInterfaceName,
      parameterName: params.parameterName,
      requestBodyName: params.requestBodyName,
    });
  });
  statements.push(Templates.ApiClientClass.create(factory, list));
  store.addAdditionalStatement(statements);
};
