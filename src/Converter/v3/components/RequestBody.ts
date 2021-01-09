import * as ts from "typescript";

import { Factory } from "../../../TypeScriptCodeGenerator";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";
import * as MediaType from "./MediaType";

export const generateInterface = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  requestBody: OpenApi.RequestBody,
  context: ToTypeNode.Context,
): ts.InterfaceDeclaration => {
  const contentSignatures = MediaType.generatePropertySignatures(entryPoint, currentPoint, factory, requestBody.content || {}, context);
  return factory.InterfaceDeclaration.create({
    export: true,
    name,
    members: contentSignatures,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#requestBodyObject`,
  });
};

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  parentName: string,
  name: string,
  requestBody: OpenApi.RequestBody,
  context: ToTypeNode.Context,
): void => {
  const basePath = `${parentName}/${name}`;
  store.addStatement(basePath, {
    type: "namespace",
    name,
    value: factory.Namespace.create({
      export: true,
      name,
      comment: requestBody.description,
      statements: [generateInterface(entryPoint, currentPoint, factory, "Content", requestBody, context)],
    }),
    statements: {},
  });
};
