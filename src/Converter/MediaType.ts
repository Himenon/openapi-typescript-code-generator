import ts from "typescript";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import { convert } from "./toTypeNode";

export const generatePropertySignature = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  protocol: string,
  schema: OpenApi.Schema,
): ts.PropertySignature => {
  return factory.Property({
    name: `"${protocol}"`,
    optional: false,
    type: convert(entryPoint, currentPoint, factory, schema),
  });
};

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  content: OpenApi.MapLike<string, OpenApi.MediaType>,
): ts.PropertySignature[] => {
  return Object.entries(content).reduce<ts.PropertySignature[]>((previous, [protocol, mediaType]) => {
    if (!mediaType.schema) {
      return previous;
    }
    return previous.concat(generatePropertySignature(entryPoint, currentPoint, factory, protocol, mediaType.schema));
  }, []);
};
