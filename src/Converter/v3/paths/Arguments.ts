import ts from "typescript";

import { Factory } from "../../../TypeScriptCodeGenerator";
import { Store } from "../store";
import { OpenApi } from "../types";

const OPERATIONS: (keyof OpenApi.PathItem)[] = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

const operationToInterface = (
  store: Store.Type,
  method: keyof OpenApi.PathItem,
  factory: Factory.Type,
  operation: OpenApi.Operation,
): ts.InterfaceDeclaration => {
  const operationId = operation.operationId;
  if (!operationId) {
    throw new Error("not found operationId\n" + JSON.stringify(operation, null, 2));
  }
  const state = store.getOperationState(operationId);
  return factory.Interface({
    export: true,
    name: `Params$${operationId}`,
    members: [
      state.parameterTypeName &&
        factory.Property({
          name: "parameter",
          optional: false,
          type: factory.TypeReferenceNode.create({
            name: state.parameterTypeName,
          }),
        }),
      state.requestBodyTypeName &&
        factory.Property({
          name: "requestBody",
          optional: false,
          type: factory.TypeReferenceNode.create({
            name: state.requestBodyTypeName,
          }),
        }),
    ].filter(Boolean) as ts.PropertySignature[],
    comment: operation.description,
  });
};

const pathItemToInterfaces = (store: Store.Type, factory: Factory.Type, pathItem: OpenApi.PathItem): ts.InterfaceDeclaration[] => {
  return OPERATIONS.reduce<ts.InterfaceDeclaration[]>((acc, method) => {
    const operation = pathItem[method] as OpenApi.Operation;
    if (operation) {
      acc.push(operationToInterface(store, method, factory, operation));
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
