import ts from "typescript";

import { Factory } from "../../../TypeScriptCodeGenerator";
import { Store } from "../store";
import { OpenApi } from "../types";
import * as Templates from "./Templates";

const OPERATIONS: (keyof OpenApi.PathItem)[] = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

const pathItemToInterfaces = (store: Store.Type, factory: Factory.Type, pathItem: OpenApi.PathItem): ts.InterfaceDeclaration[] => {
  return OPERATIONS.reduce<ts.InterfaceDeclaration[]>((acc, method) => {
    const operation = pathItem[method] as OpenApi.Operation;
    if (operation && operation.operationId) {
      const state = store.getOperationState(operation.operationId);
      // const a = Templates.generateRequestTypes(factory, operation.operationId, state.parameterTypeName, state.requestBodyTypeName);
      const b = Templates.generateFunctionArgumentInterface(
        factory,
        `Params$${operation.operationId}`,
        state.parameterTypeName,
        state.requestBodyTypeName,
      );
      // acc.push(a);
      acc.push(b);
    }
    return acc;
  }, []);
};

export const generateInterfaces = (store: Store.Type, factory: Factory.Type, paths: OpenApi.Paths): ts.InterfaceDeclaration[] => {
  return Object.values(paths)
    .map(pathItem => {
      return pathItemToInterfaces(store, factory, pathItem);
    })
    .flat();
};
