<<<<<<< HEAD
=======
import type ts from "typescript";

>>>>>>> 7b64d04cab4a272c3f6e680fa294110083ae3879
import type { OpenApi } from "../../../types";
import type { Factory } from "../../TsGenerator";
import type * as ConverterContext from "../ConverterContext";
import type * as ToTypeNode from "../toTypeNode";
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
): string => {
  /**
   * requestBody:
   *   content:
   *     application/json: {}
   */
  const hasValidMediaType = Object.values(requestBody.content).filter(mediaType => Object.values(mediaType).length > 0).length > 0;
  const contentSignatures = MediaType.generatePropertySignatures(
    entryPoint,
    currentPoint,
    factory,
    hasValidMediaType ? requestBody.content : {},
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
