import ts from "typescript";

import type { OpenApi } from "../../../types";
import { Factory } from "../../TsGenerator";
import * as ConverterContext from "../ConverterContext";
import * as ToTypeNode from "../toTypeNode";
import type * as Walker from "../Walker";
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
  store: Walker.Store,
  factory: Factory.Type,
  parentName: string,
  name: string,
  requestBody: OpenApi.RequestBody,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): void => {
  const escapeName = converterContext.escapeDeclarationText(name);
  const basePath = `${parentName}/${name}`;
  store.addStatement(basePath, {
    kind: "namespace",
    name: converterContext.escapeDeclarationText(escapeName),
    comment: requestBody.description,
  });
  store.addStatement(`${basePath}/Content`, {
    kind: "interface",
    name: "Content",
    value: generateInterface(entryPoint, currentPoint, factory, "Content", requestBody, context, converterContext),
  });
};
