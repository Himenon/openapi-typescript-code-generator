<<<<<<< HEAD
=======
import type ts from "typescript";

>>>>>>> 7b64d04cab4a272c3f6e680fa294110083ae3879
import type { OpenApi } from "../../../types";
import type { Factory } from "../../TsGenerator";
import type * as ConverterContext from "../ConverterContext";
import * as ToTypeNode from "../toTypeNode";

export const generatePropertySignature = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  protocol: string,
  schema: OpenApi.Schema,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): string => {
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
): string[] => {
  return Object.entries(content).reduce<string[]>((previous, [protocol, mediaType]) => {
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
): string => {
  return factory.InterfaceDeclaration.create({
    export: true,
    name,
    members: generatePropertySignatures(entryPoint, currentPoint, factory, content, context, converterContext),
  });
};
