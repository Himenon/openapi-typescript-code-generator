import ts from "typescript";

import { Factory } from "../../../TypeScriptCodeGenerator";
import { OpenApi } from "../types";

const OPERATIONS: (keyof OpenApi.PathItem)[] = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

const operationToInterface = (method: keyof OpenApi.PathItem, factory: Factory.Type, operation: OpenApi.Operation): ts.InterfaceDeclaration => {
  if (!operation.operationId) {
    throw new Error("not found operationId\n" + JSON.stringify(operation, null, 2));
  }
  return factory.Interface({
    export: true,
    name: `Params$${operation.operationId}`,
    members: [
      factory.Property({
        name: "parameter",
        optional: false,
        type: factory.TypeReferenceNode.create({
          name: "PathItems.",
        }),
      }),
      factory.Property({
        name: "requestBody",
        optional: false,
        type: factory.TypeReferenceNode.create({
          name: "PathItems.",
        }),
      }),
    ],
    comment: operation.description,
  });
};

const pathItemToInterfaces = (factory: Factory.Type, pathItem: OpenApi.PathItem): ts.InterfaceDeclaration[] => {
  return OPERATIONS.reduce<ts.InterfaceDeclaration[]>((acc, method) => {
    const operation = pathItem[method] as OpenApi.Operation;
    if (operation) {
      acc.push(operationToInterface(method, factory, operation));
    }
    return acc;
  }, []);
};

export const generateInterfaces = (factory: Factory.Type, paths: OpenApi.Paths): ts.InterfaceDeclaration[] => {
  return Object.values(paths)
    .map(pathItem => {
      return pathItemToInterfaces(factory, pathItem);
    })
    .flat();
};
