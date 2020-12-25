import * as ts from "typescript";
import { Factory } from "../TypeScriptCodeGenerator";
import { FeatureDevelopmentError } from "../Exception";
import * as ToTypeNode from "./toTypeNode";
import * as ExternalDocumentation from "./ExternalDocumentation";
import { ObjectSchema, PrimitiveSchema } from "./types";
import * as Guard from "./Guard";

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schema: ObjectSchema,
): ts.PropertySignature[] => {
  if (!schema.properties) {
    return [];
  }
  const required: string[] = schema.required || [];
  return Object.entries(schema.properties).map(([propertyName, property]) => {
    return factory.Property({
      name: propertyName,
      optional: !required.includes(propertyName),
      type: ToTypeNode.convert(entryPoint, currentPoint, factory, property, { parent: schema }),
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
    throw new FeatureDevelopmentError("Please use generateTypeAlias");
  }
  let members: ts.TypeElement[] = [];
  const propertySignatures = generatePropertySignatures(entryPoint, currentPoint, factory, schema);
  if (Guard.isObjectSchemaWithAdditionalProperties(schema)) {
    const additionalProperties = ToTypeNode.convertAdditionalProperties(entryPoint, currentPoint, factory, schema);
    if (schema.additionalProperties === true) {
      members = members.concat(additionalProperties);
    } else {
      members = [...propertySignatures, additionalProperties];
    }
  } else {
    members = propertySignatures;
  }
  return factory.Interface({
    export: true,
    name,
    members,
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
  let type: ts.TypeNode;
  if (schema.enum) {
    if (Guard.isNumberArray(schema.enum) && (schema.type === "number" || schema.type === "integer")) {
      type = factory.TypeNode({
        type: schema.type,
        enum: schema.enum,
      });
    } else if (Guard.isStringArray(schema.enum) && schema.type === "string") {
      type = factory.TypeNode({
        type: schema.type,
        enum: schema.enum,
      });
    } else {
      type = factory.TypeNode({
        type: schema.type,
      });
    }
  } else {
    type = factory.TypeNode({
      type: schema.type,
    });
  }
  return factory.TypeAliasDeclaration({
    export: true,
    name,
    type,
  });
};
