import ts, { skipPartiallyEmittedExpressions } from "typescript";

import type { OpenApi } from "../../../types";
import { FeatureDevelopmentError } from "../../Exception";
import { Factory } from "../../TsGenerator";
import * as ConvertContext from "../ConverterContext";
import * as Guard from "../Guard";
import * as ToTypeNode from "../toTypeNode";
import type { AnySchema, ArraySchema, ObjectSchema, PrimitiveSchema } from "../types";
import type * as Walker from "../Walker";
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
    if (!property) {
      return factory.PropertySignature.create({
        name: convertContext.escapePropertySignatureName(propertyName),
        optional: !required.includes(propertyName),
        comment: [schema.title, schema.description].filter(v => !!v).join("\n\n"),
        type: factory.TypeNode.create({
          type: "any",
        }),
      });
    }
    return factory.PropertySignature.create({
      name: convertContext.escapePropertySignatureName(propertyName),
      optional: !required.includes(propertyName),
      type: ToTypeNode.convert(entryPoint, currentPoint, factory, property, context, convertContext, { parent: schema }),
      comment: typeof property !== "boolean" ? [property.title, property.description].filter(v => !!v).join("\n\n") : undefined,
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
    name: convertContext.escapeDeclarationText(name),
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
    name: convertContext.escapeDeclarationText(name),
    comment: [schema.title, schema.description].filter(v => !!v).join("\n\n"),
    type: ToTypeNode.convert(entryPoint, currentPoint, factory, schema, context, convertContext),
  });
};

const createNullableTypeNodeOrAny = (factory: Factory.Type, schema: OpenApi.Schema) => {
  const typeNode = factory.TypeNode.create({
    type: "any",
  });
  if (!schema.type && typeof schema.nullable === "boolean") {
    return factory.TypeNode.create({
      type: "null",
    });
  }
  return typeNode;
};

/**
 * 型定義が特定できなかった場合に利用する
 */
export const generateNotInferedTypeAlias = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  schema: OpenApi.Schema,
  convertContext: ConvertContext.Types,
) => {
  const typeNode = createNullableTypeNodeOrAny(factory, schema);
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: convertContext.escapeDeclarationText(name),
    type: typeNode,
    comment: [schema.title, schema.description].filter(v => !!v).join("\n\n"),
  });
};

export const generateTypeAlias = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  schema: PrimitiveSchema | AnySchema,
  convertContext: ConvertContext.Types,
): ts.TypeAliasDeclaration => {
  let type: ts.TypeNode;
  let formatTypeNode: ts.TypeNode | undefined;
  if (schema.format && schema.type !== "any") {
    formatTypeNode = convertContext.convertFormatTypeNode(schema);
  }
  if (formatTypeNode) {
    type = formatTypeNode;
  } else if (schema.enum) {
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
    } else if (schema.type === "boolean") {
      type = factory.TypeNode.create({
        type: schema.type,
        enum: Guard.isBooleanArray(schema.enum) ? schema.enum : undefined,
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
    name: convertContext.escapeDeclarationText(name),
    type,
    comment: [schema.title, schema.description].filter(v => !!v).join("\n\n"),
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
    name: convertContext.escapeDeclarationText(name),
    type,
  });
};

export const addSchema = (
  entryPoint: string,
  currentPoint: string,
  store: Walker.Store,
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
      name: convertContext.escapeDeclarationText(declarationName),
      value: generateMultiTypeAlias(entryPoint, currentPoint, factory, declarationName, schema.allOf, context, "allOf", convertContext),
    });
  } else if (Guard.isOneOfSchema(schema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: convertContext.escapeDeclarationText(declarationName),
      value: generateMultiTypeAlias(entryPoint, currentPoint, factory, declarationName, schema.oneOf, context, "oneOf", convertContext),
    });
  } else if (Guard.isAnyOfSchema(schema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: convertContext.escapeDeclarationText(declarationName),
      value: generateMultiTypeAlias(entryPoint, currentPoint, factory, declarationName, schema.anyOf, context, "allOf", convertContext),
    });
  } else if (Guard.isArraySchema(schema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: convertContext.escapeDeclarationText(declarationName),
      value: generateArrayTypeAlias(entryPoint, currentPoint, factory, declarationName, schema, context, convertContext),
    });
  } else if (Guard.isObjectSchema(schema)) {
    store.addStatement(targetPoint, {
      kind: "interface",
      name: convertContext.escapeDeclarationText(declarationName),
      value: generateInterface(entryPoint, currentPoint, factory, declarationName, schema, context, convertContext),
    });
  } else if (Guard.isPrimitiveSchema(schema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: convertContext.escapeDeclarationText(declarationName),
      value: generateTypeAlias(entryPoint, currentPoint, factory, declarationName, schema, convertContext),
    });
  }
};
