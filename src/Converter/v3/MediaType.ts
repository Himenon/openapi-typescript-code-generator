import ts from "typescript";
import { OpenApi } from "./types";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as ToTypeNode from "./toTypeNode";

export const generatePropertySignature = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  protocol: string,
  schema: OpenApi.Schema,
  context: ToTypeNode.Context,
): ts.PropertySignature => {
  return factory.Property({
    name: `"${protocol}"`,
    optional: false,
    type: ToTypeNode.convert(entryPoint, currentPoint, factory, schema, context),
  });
};

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  content: OpenApi.MapLike<string, OpenApi.MediaType>,
  context: ToTypeNode.Context,
): ts.PropertySignature[] => {
  return Object.entries(content).reduce<ts.PropertySignature[]>((previous, [protocol, mediaType]) => {
    if (!mediaType.schema) {
      return previous;
    }
    return previous.concat(generatePropertySignature(entryPoint, currentPoint, factory, protocol, mediaType.schema, context));
  }, []);
};
