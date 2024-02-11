import ts from "typescript";

import type { OpenApi } from "../../../types";
import { Factory } from "../../TsGenerator";
import * as ConverterContext from "../ConverterContext";
import * as Guard from "../Guard";
import type * as Walker from "../Walker";
import * as ToTypeNode from "../toTypeNode";
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

export const generatePropertySignatureObject = (
  entryPoint: string,
  currentPoint: string,
  store: Walker.Store,
  factory: Factory.Type,
  parameter: OpenApi.Parameter | OpenApi.Reference,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): { name: string; typeElement: ts.PropertySignature } => {
  if (Guard.isReference(parameter)) {
    const reference = Reference.generate<OpenApi.Parameter>(entryPoint, currentPoint, parameter);
    if (reference.type === "local") {
      context.setReferenceHandler(currentPoint, reference);
      const localRef = store.getParameter(reference.path);
      const isPathProperty = localRef.in === "path";
      const name = converterContext.escapePropertySignatureName(localRef.name);
      const typeElement = factory.PropertySignature.create({
        readOnly: false,
        name: name,
        optional: isPathProperty ? false : !localRef.required,
        comment: localRef.description,
        type: factory.TypeReferenceNode.create({
          name: context.resolveReferencePath(currentPoint, reference.path).name,
        }),
      });
      return {
        name,
        typeElement: typeElement,
      };
    }
    const isPathProperty = reference.data.in === "path";
    const name = converterContext.escapePropertySignatureName(reference.data.name);
    const typeElement = factory.PropertySignature.create({
      readOnly: false,
      name: name,
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
    return {
      name,
      typeElement: typeElement,
    };
  }
  const isPathProperty = parameter.in === "path";
  const name = converterContext.escapePropertySignatureName(parameter.name);
  const typeElement = factory.PropertySignature.create({
    readOnly: false,
    name: name,
    optional: isPathProperty ? false : !parameter.required,
    type: ToTypeNode.convert(entryPoint, currentPoint, factory, parameter.schema || { type: "null" }, context, converterContext),
    comment: parameter.description,
  });
  return {
    name,
    typeElement: typeElement,
  };
};

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  store: Walker.Store,
  factory: Factory.Type,
  parameters: (OpenApi.Parameter | OpenApi.Reference)[],
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): ts.PropertySignature[] => {
  const typeElementMap = parameters.reduce<Record<string, ts.PropertySignature>>((all, parameter) => {
    const { name, typeElement } = generatePropertySignatureObject(
      entryPoint,
      currentPoint,
      store,
      factory,
      parameter,
      context,
      converterContext,
    );
    return { ...all, [name]: typeElement };
  }, {});
  return Object.values(typeElementMap);
};

export const generateInterface = (
  entryPoint: string,
  currentPoint: string,
  store: Walker.Store,
  factory: Factory.Type,
  name: string,
  parameters: (OpenApi.Parameter | OpenApi.Reference)[],
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
  store: Walker.Store,
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
