import * as ts from "typescript";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import { UnsetTypeError, UnSupportError } from "../Exception";
import * as ToTypeNode from "./toTypeNode";
import * as ExternalDocumentation from "./ExternalDocumentation";

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schema: OpenApi.Schema,
): ts.PropertySignature[] => {
  if (schema.type !== "object") {
    throw new UnSupportError(JSON.stringify(schema));
  }
  if (!schema.properties) {
    throw new UnsetTypeError("schema.properties");
  }
  return Object.entries(schema.properties).map(([propertyName, property]) => {
    return factory.Property({
      name: propertyName,
      type: ToTypeNode.convert(entryPoint, currentPoint, factory, property),
      comment: typeof property !== "boolean" ? property.description : undefined,
    });
  });
};

/**
 *
 * @docs
 */
export const generateInterface = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  schema: OpenApi.Schema,
): ts.InterfaceDeclaration => {
  return factory.Interface({
    export: true,
    name,
    members: generatePropertySignatures(entryPoint, currentPoint, factory, schema),
    comment: ExternalDocumentation.addComment(schema.description, schema.externalDocs),
  });
};
