import ts from "typescript";

import { Factory } from "../../CodeGenerator";
import * as ConverterContext from "../ConverterContext";
import * as Guard from "../Guard";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";
import * as Reference from "./Reference";

export const generateTypeNode = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  parameter: OpenApi.Parameter,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): ts.TypeNode => {
  return ToTypeNode.convert(entryPoint, currentPoint, factory, parameter.schema || { type: "null" }, context, converterContext);
};

export const generateTypeAlias = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  parameter: OpenApi.Parameter,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): ts.TypeAliasDeclaration => {
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: converterContext.escapeDeclarationText(name),
    comment: parameter.description,
    type: generateTypeNode(entryPoint, currentPoint, factory, parameter, context, converterContext),
  });
};

export const generatePropertySignature = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  parameter: OpenApi.Parameter | OpenApi.Reference,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): ts.PropertySignature => {
  if (Guard.isReference(parameter)) {
    const reference = Reference.generate<OpenApi.Parameter>(entryPoint, currentPoint, parameter);
    if (reference.type === "local") {
      context.setReferenceHandler(currentPoint, reference);
      const localRef = store.getParameter(reference.path);
      return factory.PropertySignature.create({
        name: converterContext.escapePropertySignatureName(localRef.name),
        optional: false,
        comment: localRef.description,
        type: factory.TypeReferenceNode.create({
          name: context.resolveReferencePath(currentPoint, reference.path).name,
        }),
      });
    }
    const isPathProperty = reference.data.in === "path";
    return factory.PropertySignature.create({
      name: converterContext.escapePropertySignatureName(reference.data.name),
      optional: isPathProperty ? false : !reference.data.required,
      comment: reference.data.description,
      type: ToTypeNode.convert(
        entryPoint,
        reference.referencePoint,
        factory,
        reference.data.schema || { type: "null" },
        context,
        converterContext,
      ),
    });
  }
  const isPathProperty = parameter.in === "path";
  return factory.PropertySignature.create({
    name: converterContext.escapePropertySignatureName(parameter.name),
    optional: isPathProperty ? false : !parameter.required,
    type: ToTypeNode.convert(entryPoint, currentPoint, factory, parameter.schema || { type: "null" }, context, converterContext),
    comment: parameter.description,
  });
};

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  parameters: (OpenApi.Parameter | OpenApi.Reference)[],
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): ts.PropertySignature[] => {
  return parameters.map(parameter => {
    return generatePropertySignature(entryPoint, currentPoint, store, factory, parameter, context, converterContext);
  });
};

export const generateInterface = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  name: string,
  parameters: [OpenApi.Parameter | OpenApi.Reference],
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): ts.InterfaceDeclaration => {
  return factory.InterfaceDeclaration.create({
    export: true,
    name,
    members: generatePropertySignatures(entryPoint, currentPoint, store, factory, parameters, context, converterContext),
  });
};

/**
 * Alias作成用
 */
export const generateAliasInterface = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  name: string,
  parameters: (OpenApi.Parameter | OpenApi.Reference)[],
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): ts.InterfaceDeclaration => {
  return factory.InterfaceDeclaration.create({
    export: true,
    name: converterContext.escapeDeclarationText(name),
    members: generatePropertySignatures(entryPoint, currentPoint, store, factory, parameters, context, converterContext),
  });
};
