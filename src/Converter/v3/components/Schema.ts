import ts from "typescript";

import { Factory } from "../../../CodeGenerator";
import { FeatureDevelopmentError } from "../../../Exception";
import * as ConvertContext from "../ConverterContext";
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
  convertContext: ConvertContext.Types,
): ts.PropertySignature[] => {
  if (!schema.properties) {
    return [];
  }
  const required: string[] = schema.required || [];
  return Object.entries(schema.properties).map(([propertyName, property]) => {
    return factory.PropertySignature.create({
      name: convertContext.referenceName(propertyName),
      optional: !required.includes(propertyName),
      type: ToTypeNode.convert(entryPoint, currentPoint, factory, property, context, convertContext, { parent: schema }),
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
  convertContext: ConvertContext.Types,
): ts.InterfaceDeclaration => {
  if (schema.type !== "object") {
    throw new FeatureDevelopmentError("Please use generateTypeAlias");
  }
  let members: ts.TypeElement[] = [];
  const propertySignatures = generatePropertySignatures(entryPoint, currentPoint, factory, schema, context, convertContext);
  if (Guard.isObjectSchemaWithAdditionalProperties(schema)) {
    const additionalProperties = ToTypeNode.convertAdditionalProperties(entryPoint, currentPoint, factory, schema, context, convertContext);
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
    name: convertContext.referenceName(name),
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
  convertContext: ConvertContext.Types,
): ts.TypeAliasDeclaration => {
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: convertContext.referenceName(name),
    comment: schema.description,
    type: ToTypeNode.convert(entryPoint, currentPoint, factory, schema, context, convertContext),
  });
};

export const generateTypeAlias = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  schema: PrimitiveSchema,
  convertContext: ConvertContext.Types,
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
    name: convertContext.referenceName(name),
    type,
    comment: schema.description,
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
  convertContext: ConvertContext.Types,
): ts.TypeAliasDeclaration => {
  const type = ToTypeNode.generateMultiTypeNode(
    entryPoint,
    currentPoint,
    factory,
    schemas,
    context,
    ToTypeNode.convert,
    convertContext,
    multiType,
  );
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: convertContext.referenceName(name),
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
  convertContext: ConvertContext.Types,
): void => {
  if (!schema) {
    return;
  }
  if (Guard.isAllOfSchema(schema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: convertContext.referenceName(declarationName),
      value: generateMultiTypeAlias(entryPoint, currentPoint, factory, declarationName, schema.allOf, context, "allOf", convertContext),
    });
  } else if (Guard.isOneOfSchema(schema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: convertContext.referenceName(declarationName),
      value: generateMultiTypeAlias(entryPoint, currentPoint, factory, declarationName, schema.oneOf, context, "oneOf", convertContext),
    });
  } else if (Guard.isAnyOfSchema(schema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: convertContext.referenceName(declarationName),
      value: generateMultiTypeAlias(entryPoint, currentPoint, factory, declarationName, schema.anyOf, context, "allOf", convertContext),
    });
  } else if (Guard.isArraySchema(schema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: convertContext.referenceName(declarationName),
      value: generateArrayTypeAlias(entryPoint, currentPoint, factory, declarationName, schema, context, convertContext),
    });
  } else if (Guard.isObjectSchema(schema)) {
    store.addStatement(targetPoint, {
      kind: "interface",
      name: convertContext.referenceName(declarationName),
      value: generateInterface(entryPoint, currentPoint, factory, declarationName, schema, context, convertContext),
    });
  } else if (Guard.isPrimitiveSchema(schema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: convertContext.referenceName(declarationName),
      value: generateTypeAlias(entryPoint, currentPoint, factory, declarationName, schema, convertContext),
    });
  }
};
