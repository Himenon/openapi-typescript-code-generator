import * as ts from "typescript";
import { Factory } from "../TypeScriptCodeGenerator";
import { UnsetTypeError, DevelopmentError } from "../Exception";
import * as ToTypeNode from "./toTypeNode";
import * as ExternalDocumentation from "./ExternalDocumentation";
import * as Logger from "../Logger";
import { ObjectSchema, PrimitiveSchema } from "./types";

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schema: ObjectSchema,
): ts.PropertySignature[] => {
  if (!schema.type) {
    Logger.showFilePosition(entryPoint, currentPoint);
    throw new UnsetTypeError("schema.type");
  }
  if (!schema.properties) {
    Logger.showFilePosition(entryPoint, currentPoint);
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

export const generateInterface = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  schema: ObjectSchema,
): ts.InterfaceDeclaration => {
  if (schema.type !== "object") {
    throw new DevelopmentError("Please use generateTypeAlias");
  }
  return factory.Interface({
    export: true,
    name,
    members: generatePropertySignatures(entryPoint, currentPoint, factory, schema),
    comment: ExternalDocumentation.addComment(schema.description, schema.externalDocs),
  });
};

export const generateTypeAlias = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  schema: PrimitiveSchema,
): ts.TypeAliasDeclaration => {
  const typeNode = factory.TypeNode({
    type: schema.type,
  });
  return factory.TypeAliasDeclaration({
    export: true,
    name,
    typeNode,
  });
};
