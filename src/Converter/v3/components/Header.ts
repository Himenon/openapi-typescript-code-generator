import ts from "typescript";

import { Factory } from "../../../CodeGenerator";
import * as ConverterContext from "../ConverterContext";
import * as Guard from "../Guard";
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
  converterContext: ConverterContext.Types,
): ts.TypeAliasDeclaration => {
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: converterContext.escapeDeclarationText(name),
    type: ToTypeNode.convert(entryPoint, currentPoint, factory, header.schema || { type: "null" }, context, converterContext),
  });
};

export const generatePropertySignature = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  header: OpenApi.Header | OpenApi.Reference,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): ts.PropertySignature => {
  if (Guard.isReference(header)) {
    const reference = Reference.generate<OpenApi.Header>(entryPoint, currentPoint, header);
    if (reference.type === "local") {
      context.setReferenceHandler(currentPoint, reference);
      return factory.PropertySignature.create({
        name: converterContext.escapePropertySignatureName(name),
        optional: false,
        type: factory.TypeReferenceNode.create({
          name: context.resolveReferencePath(currentPoint, reference.path).name,
        }),
      });
    }
    return factory.PropertySignature.create({
      name: converterContext.escapePropertySignatureName(name),
      optional: false,
      type: factory.TypeReferenceNode.create({
        name: context.resolveReferencePath(currentPoint, reference.path).name,
      }),
    });
  }
  return factory.PropertySignature.create({
    name: converterContext.escapePropertySignatureName(name),
    optional: false,
    type: ToTypeNode.convert(entryPoint, currentPoint, factory, header.schema || { type: "null" }, context, converterContext),
  });
};

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  headers: Record<string, OpenApi.Header | OpenApi.Reference>,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): ts.PropertySignature[] => {
  return Object.entries(headers).map(([headerName, header]) => {
    return generatePropertySignature(entryPoint, currentPoint, factory, headerName, header, context, converterContext);
  });
};

export const generateInterface = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  headers: Record<string, OpenApi.Header | OpenApi.Reference>,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): ts.InterfaceDeclaration => {
  return factory.InterfaceDeclaration.create({
    export: true,
    name: converterContext.escapeDeclarationText(name),
    members: generatePropertySignatures(entryPoint, currentPoint, factory, headers, context, converterContext),
  });
};
