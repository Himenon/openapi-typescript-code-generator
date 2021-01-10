import ts from "typescript";

import { Factory } from "../../../CodeGenerator";
import * as Guard from "../Guard";
import * as Name from "../Name";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";
import * as Reference from "./Reference";

export const generateTypeNode = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  header: OpenApi.Header,
  context: ToTypeNode.Context,
): ts.TypeAliasDeclaration => {
  return factory.TypeAliasDeclaration.create({
    export: true,
    name,
    type: ToTypeNode.convert(entryPoint, currentPoint, factory, header.schema || { type: "null" }, context),
  });
};

export const generatePropertySignature = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  header: OpenApi.Header | OpenApi.Reference,
  context: ToTypeNode.Context,
): ts.PropertySignature => {
  if (Guard.isReference(header)) {
    const reference = Reference.generate<OpenApi.Header>(entryPoint, currentPoint, header);
    if (reference.type === "local") {
      context.setReferenceHandler(reference);
      return factory.PropertySignature.create({
        name,
        optional: false,
        type: factory.TypeReferenceNode.create({
          name: context.getReferenceName(currentPoint, reference.path, "local"),
        }),
      });
    }
    return factory.PropertySignature.create({
      name,
      optional: false,
      type: ToTypeNode.convert(entryPoint, currentPoint, factory, reference.data.schema || { type: "null" }, context),
    });
  }
  return factory.PropertySignature.create({
    name: Name.escapeText(name),
    optional: false,
    type: ToTypeNode.convert(entryPoint, currentPoint, factory, header.schema || { type: "null" }, context),
  });
};

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  headers: OpenApi.MapLike<string, OpenApi.Header | OpenApi.Reference>,
  context: ToTypeNode.Context,
): ts.PropertySignature[] => {
  return Object.entries(headers).map(([headerName, header]) => {
    return generatePropertySignature(entryPoint, currentPoint, factory, headerName, header, context);
  });
};

export const generateInterface = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  headers: OpenApi.MapLike<string, OpenApi.Header | OpenApi.Reference>,
  context: ToTypeNode.Context,
): ts.InterfaceDeclaration => {
  return factory.InterfaceDeclaration.create({
    export: true,
    name,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#headerObject`,
    members: generatePropertySignatures(entryPoint, currentPoint, factory, headers, context),
  });
};
