import * as ts from "typescript";

import { Factory } from "../../../CodeGenerator";
import * as ConverterContext from "../ConverterContext";
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
  converterContext: ConverterContext.Types,
): ts.InterfaceDeclaration => {
  const contentSignatures = MediaType.generatePropertySignatures(
    entryPoint,
    currentPoint,
    factory,
    requestBody.content || {},
    context,
    converterContext,
  );
  return factory.InterfaceDeclaration.create({
    export: true,
    name,
    members: contentSignatures,
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
  converterContext: ConverterContext.Types,
): void => {
  const basePath = `${parentName}/${name}`;
  store.addStatement(basePath, {
    kind: "namespace",
    name,
    comment: requestBody.description,
  });
  store.addStatement(`${basePath}/Content`, {
    kind: "interface",
    name: "Content",
    value: generateInterface(entryPoint, currentPoint, factory, "Content", requestBody, context, converterContext),
  });
};
