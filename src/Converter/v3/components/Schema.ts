import ts from "typescript";

import { Factory } from "../../../CodeGenerator";
import { FeatureDevelopmentError } from "../../../Exception";
import * as Guard from "../Guard";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { ArraySchema, ObjectSchema, OpenApi, PrimitiveSchema } from "../types";
import * as ExternalDocumentation from "./ExternalDocumentation";

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schema: ObjectSchema,
  context: ToTypeNode.Context,
): ts.PropertySignature[] => {
  if (!schema.properties) {
    return [];
  }
  const required: string[] = schema.required || [];
  return Object.entries(schema.properties).map(([propertyName, property]) => {
    return factory.PropertySignature.create({
      name: propertyName,
      optional: !required.includes(propertyName),
      type: ToTypeNode.convert(entryPoint, currentPoint, factory, property, context, { parent: schema }),
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
  context: ToTypeNode.Context,
): ts.InterfaceDeclaration => {
  if (schema.type !== "object") {
    throw new FeatureDevelopmentError("Please use generateTypeAlias");
  }
  let members: ts.TypeElement[] = [];
  const propertySignatures = generatePropertySignatures(entryPoint, currentPoint, factory, schema, context);
  if (Guard.isObjectSchemaWithAdditionalProperties(schema)) {
    const additionalProperties = ToTypeNode.convertAdditionalProperties(entryPoint, currentPoint, factory, schema, context);
    if (schema.additionalProperties === true) {
      members = members.concat(additionalProperties);
    } else {
      members = [...propertySignatures, additionalProperties];
    }
  } else {
    members = propertySignatures;
  }
  return factory.InterfaceDeclaration.create({
    export: true,
    name,
    members,
    comment: ExternalDocumentation.addComment(schema.description, schema.externalDocs),
  });
};

export const generateArrayTypeAlias = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  schema: ArraySchema,
  context: ToTypeNode.Context,
): ts.TypeAliasDeclaration => {
  return factory.TypeAliasDeclaration.create({
    export: true,
    name,
    comment: schema.description,
    type: ToTypeNode.convert(entryPoint, currentPoint, factory, schema, context),
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
      type = factory.TypeNode.create({
        type: schema.type,
        enum: schema.enum,
      });
    } else if (Guard.isStringArray(schema.enum) && schema.type === "string") {
      type = factory.TypeNode.create({
        type: schema.type,
        enum: schema.enum,
      });
    } else {
      type = factory.TypeNode.create({
        type: schema.type,
      });
    }
  } else {
    type = factory.TypeNode.create({
      type: schema.type,
    });
  }
  return factory.TypeAliasDeclaration.create({
    export: true,
    name,
    type,
  });
};

export const generateMultiTypeAlias = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  schemas: OpenApi.Schema[],
  context: ToTypeNode.Context,
  multiType: "oneOf" | "allOf" | "anyOf",
): ts.TypeAliasDeclaration => {
  const type = ToTypeNode.generateMultiTypeNode(entryPoint, currentPoint, factory, schemas, context, ToTypeNode.convert, multiType);
  return factory.TypeAliasDeclaration.create({
    export: true,
    name,
    type,
  });
};

export const addSchema = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  targetPoint: string,
  declarationName: string,
  schema: OpenApi.Schema | undefined,
  context: ToTypeNode.Context,
): void => {
  if (!schema) {
    return;
  }
  if (Guard.isAllOfSchema(schema)) {
    store.addStatement(targetPoint, {
      type: "typeAlias",
      name: declarationName,
      value: generateMultiTypeAlias(entryPoint, currentPoint, factory, declarationName, schema.allOf, context, "allOf"),
    });
  } else if (Guard.isOneOfSchema(schema)) {
    store.addStatement(targetPoint, {
      type: "typeAlias",
      name: declarationName,
      value: generateMultiTypeAlias(entryPoint, currentPoint, factory, declarationName, schema.oneOf, context, "oneOf"),
    });
  } else if (Guard.isAnyOfSchema(schema)) {
    store.addStatement(targetPoint, {
      type: "typeAlias",
      name: declarationName,
      value: generateMultiTypeAlias(entryPoint, currentPoint, factory, declarationName, schema.anyOf, context, "allOf"),
    });
  } else if (Guard.isArraySchema(schema)) {
    store.addStatement(targetPoint, {
      type: "typeAlias",
      name: declarationName,
      value: generateArrayTypeAlias(entryPoint, currentPoint, factory, declarationName, schema, context),
    });
  } else if (Guard.isObjectSchema(schema)) {
    store.addStatement(targetPoint, {
      type: "interface",
      name: declarationName,
      value: generateInterface(entryPoint, currentPoint, factory, declarationName, schema, context),
    });
  } else if (Guard.isPrimitiveSchema(schema)) {
    store.addStatement(targetPoint, {
      type: "typeAlias",
      name: declarationName,
      value: generateTypeAlias(entryPoint, currentPoint, factory, declarationName, schema),
    });
  }
};
