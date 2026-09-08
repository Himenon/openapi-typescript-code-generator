import type { OpenApi } from "../../../types";
import { FeatureDevelopmentError } from "../../Exception";
import type { Factory } from "../../TsGenerator";
import type * as ConvertContext from "../ConverterContext";
import * as Guard from "../Guard";
import * as InferredType from "../InferredType";
import * as ToTypeNode from "../toTypeNode";
import type { AnySchema, ArraySchema, ObjectSchema, PrimitiveSchema, TypeArraySchema } from "../types";
import type * as Walker from "../Walker";
import * as ExternalDocumentation from "./ExternalDocumentation";

const nullable = (factory: Factory.Type, typeNode: string, isNullable: boolean): string => {
  if (isNullable) {
    return factory.UnionTypeNode.create({
      typeNodes: [
        typeNode,
        factory.TypeNode.create({
          type: "null",
        }),
      ],
    });
  }
  return typeNode;
};

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schema: ObjectSchema,
  context: ToTypeNode.Context,
  convertContext: ConvertContext.Types,
): string[] => {
  if (!schema.properties) {
    return [];
  }
  const required: string[] = schema.required || [];
  return Object.entries(schema.properties).map(([propertyName, property]) => {
    if (property === undefined) {
      return factory.PropertySignature.create({
        readOnly: false,
        name: convertContext.escapePropertySignatureName(propertyName),
        optional: !required.includes(propertyName),
        comment: [schema.title, schema.description].filter(v => !!v).join("\n\n"),
        type: factory.TypeNode.create({
          type: "any",
        }),
      });
    }
    return factory.PropertySignature.create({
      readOnly: typeof property !== "boolean" ? !!property.readOnly : false,
      name: convertContext.escapePropertySignatureName(propertyName),
      optional: !required.includes(propertyName),
      type: ToTypeNode.convert(entryPoint, currentPoint, factory, property, context, convertContext, { parent: schema, schemaRoot: schema }),
      comment: typeof property !== "boolean" ? [property.title, property.description].filter(v => !!v).join("\n\n") : undefined,
    });
  });
};

export const generateTypeAliasDeclarationForObject = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  schema: ObjectSchema,
  context: ToTypeNode.Context,
  convertContext: ConvertContext.Types,
): string => {
  if (schema.type !== "object") {
    throw new FeatureDevelopmentError("Please use generateTypeAlias");
  }
  let members: string[] = [];
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
  const typeNode = factory.TypeLiteralNode.create({
    members,
  });
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: convertContext.escapeDeclarationText(name),
    comment: [schema.title, schema.description].filter(v => !!v).join("\n\n"),
    type: nullable(factory, typeNode, schema.nullable === true),
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
): string => {
  if (schema.type !== "object") {
    throw new FeatureDevelopmentError("Please use generateTypeAlias");
  }
  let members: string[] = [];
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
): string => {
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: convertContext.escapeDeclarationText(name),
    comment: [schema.title, schema.description].filter(v => !!v).join("\n\n"),
    type: ToTypeNode.convert(entryPoint, currentPoint, factory, schema, context, convertContext, { schemaRoot: schema }),
  });
};

const createNullableTypeNodeOrAny = (factory: Factory.Type, schema: OpenApi.Schema): string => {
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
  _entryPoint: string,
  _currentPoint: string,
  factory: Factory.Type,
  name: string,
  schema: OpenApi.Schema,
  convertContext: ConvertContext.Types,
): string => {
  const typeNode = createNullableTypeNodeOrAny(factory, schema);
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: convertContext.escapeDeclarationText(name),
    type: typeNode,
    comment: [schema.title, schema.description].filter(v => !!v).join("\n\n"),
  });
};

export const generateTypeAlias = (
  _entryPoint: string,
  _currentPoint: string,
  factory: Factory.Type,
  name: string,
  schema: PrimitiveSchema | AnySchema,
  convertContext: ConvertContext.Types,
): string => {
  let type: string;
  const constTypeNode = ToTypeNode.generateLiteralTypeNode(factory, schema.const);
  let formatTypeNode: string | undefined;
  if (schema.format && schema.type !== "any") {
    formatTypeNode = convertContext.convertFormatTypeNode(schema);
  }
  // OpenAPI 3.1 で追加された JSON Schema の const は enum よりも具体的なリテラル型です。
  if (Object.hasOwn(schema, "const") && constTypeNode) {
    type = constTypeNode;
  } else if (formatTypeNode) {
    type = schema.nullable === true ? `(${formatTypeNode})` : formatTypeNode;
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
    type: nullable(factory, type, schema.nullable === true),
    comment: [schema.title, schema.description].filter(v => !!v).join("\n\n"),
  });
};

/** OpenAPI 3.1 で追加された type 配列を、複数型の union として出力します。 */
export const generateTypeAliasForTypeArray = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  schema: TypeArraySchema,
  context: ToTypeNode.Context,
  convertContext: ConvertContext.Types,
): string => {
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: convertContext.escapeDeclarationText(name),
    type: ToTypeNode.convert(entryPoint, currentPoint, factory, schema, context, convertContext, { schemaRoot: schema }),
    comment: [schema.title, schema.description].filter(v => !!v).join("\n\n"),
  });
};

export const generateMultiTypeAlias = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  schemas: OpenApi.JSONSchemaDefinition[],
  context: ToTypeNode.Context,
  multiType: "oneOf" | "allOf" | "anyOf",
  convertContext: ConvertContext.Types,
  schemaRoot?: OpenApi.Schema,
): string => {
  const type = ToTypeNode.generateMultiTypeNode(
    entryPoint,
    currentPoint,
    factory,
    schemas,
    context,
    ToTypeNode.convert,
    convertContext,
    multiType,
    schemaRoot,
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
  schema: OpenApi.JSONSchemaDefinition | undefined,
  context: ToTypeNode.Context,
  convertContext: ConvertContext.Types,
): void => {
  if (schema === undefined) {
    return;
  }
  if (typeof schema === "boolean") {
    // OpenAPI 3.1 で boolean schema が利用可能になりました。
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: convertContext.escapeDeclarationText(declarationName),
      value: factory.TypeAliasDeclaration.create({
        export: true,
        name: convertContext.escapeDeclarationText(declarationName),
        type: ToTypeNode.convert(entryPoint, currentPoint, factory, schema, context, convertContext),
      }),
    });
    return;
  }
  const inferredSchema = InferredType.getInferredType(schema);
  if (!inferredSchema) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: convertContext.escapeDeclarationText(declarationName),
      value: generateNotInferedTypeAlias(entryPoint, currentPoint, factory, declarationName, schema, convertContext),
    });
    return;
  }
  const targetSchema = inferredSchema;
  if (Guard.isTypeArraySchema(targetSchema)) {
    // OpenAPI 3.1 で追加された type 配列をリモート参照先でも union として出力します。
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: convertContext.escapeDeclarationText(declarationName),
      value: generateTypeAliasForTypeArray(entryPoint, currentPoint, factory, declarationName, targetSchema, context, convertContext),
    });
    return;
  }
  if (Guard.isAllOfSchema(targetSchema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: convertContext.escapeDeclarationText(declarationName),
      value: generateMultiTypeAlias(
        entryPoint,
        currentPoint,
        factory,
        declarationName,
        targetSchema.allOf,
        context,
        "allOf",
        convertContext,
        targetSchema,
      ),
    });
  } else if (Guard.isOneOfSchema(targetSchema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: convertContext.escapeDeclarationText(declarationName),
      value: generateMultiTypeAlias(
        entryPoint,
        currentPoint,
        factory,
        declarationName,
        targetSchema.oneOf,
        context,
        "oneOf",
        convertContext,
        targetSchema,
      ),
    });
  } else if (Guard.isAnyOfSchema(targetSchema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: convertContext.escapeDeclarationText(declarationName),
      value: generateMultiTypeAlias(
        entryPoint,
        currentPoint,
        factory,
        declarationName,
        targetSchema.anyOf,
        context,
        "anyOf",
        convertContext,
        targetSchema,
      ),
    });
  } else if (Guard.isArraySchema(targetSchema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: convertContext.escapeDeclarationText(declarationName),
      value: generateArrayTypeAlias(entryPoint, currentPoint, factory, declarationName, targetSchema, context, convertContext),
    });
  } else if (Guard.isObjectSchema(targetSchema)) {
    if (targetSchema.nullable) {
      store.addStatement(targetPoint, {
        kind: "typeAlias",
        name: convertContext.escapeDeclarationText(declarationName),
        value: generateTypeAliasDeclarationForObject(entryPoint, currentPoint, factory, declarationName, targetSchema, context, convertContext),
      });
    } else {
      store.addStatement(targetPoint, {
        kind: "interface",
        name: convertContext.escapeDeclarationText(declarationName),
        value: generateInterface(entryPoint, currentPoint, factory, declarationName, targetSchema, context, convertContext),
      });
    }
  } else if (Guard.isPrimitiveSchema(targetSchema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: convertContext.escapeDeclarationText(declarationName),
      value: generateTypeAlias(entryPoint, currentPoint, factory, declarationName, targetSchema, convertContext),
    });
  }
};
