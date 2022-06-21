import ts from "typescript";

import type { OpenApi } from "../../../types";
import { Factory } from "../../TsGenerator";
import * as ConverterContext from "../ConverterContext";
import * as ToTypeNode from "../toTypeNode";

export const generatePropertySignature = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  protocol: string,
  schema: OpenApi.Schema,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): ts.PropertySignature => {
  return factory.PropertySignature.create({
    readOnly: false,
    name: converterContext.escapePropertySignatureName(protocol),
    optional: false,
    type: ToTypeNode.convert(entryPoint, currentPoint, factory, schema, context, converterContext),
    comment: schema.description,
  });
};

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  content: Record<string, OpenApi.MediaType>,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): ts.PropertySignature[] => {
  return Object.entries(content).reduce<ts.PropertySignature[]>((previous, [protocol, mediaType]) => {
    if (!mediaType.schema) {
      return previous;
    }
    return previous.concat(generatePropertySignature(entryPoint, currentPoint, factory, protocol, mediaType.schema, context, converterContext));
  }, []);
};

export const generateInterface = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  content: Record<string, OpenApi.MediaType>,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): ts.InterfaceDeclaration => {
  return factory.InterfaceDeclaration.create({
    export: true,
    name,
    members: generatePropertySignatures(entryPoint, currentPoint, factory, content, context, converterContext),
  });
};
