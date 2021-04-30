import type { OpenApi } from "../../../types";
import { FeatureDevelopmentError } from "../../Exception";
import * as ADS from "../../AbstractDataStructure";
import { Factory } from "../../TsGenerator";
import * as ConvertContext from "../ConverterContext";
import * as Guard from "../Guard";
import * as ToAbstractDataStructure from "../toAbstractDataStructure";
import type { ArraySchema, ObjectSchema, PrimitiveSchema } from "../types";
import type * as Walker from "../Walker";

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schema: ObjectSchema,
  context: ToAbstractDataStructure.Context,
  convertContext: ConvertContext.Types,
): ADS.PropertySignatureStruct[] => {
  if (!schema.properties) {
    return [];
  }
  const required: string[] = schema.required || [];
  return Object.entries(schema.properties).map<ADS.PropertySignatureStruct>(([propertyName, property]) => {
    if (!property) {
      return {
        kind: "PropertySignature",
        name: convertContext.escapePropertySignatureName(propertyName),
        optional: !required.includes(propertyName),
        comment: schema.description,
        struct: {
          kind: "any",
        },
      };
    }
    return {
      kind: "PropertySignature",
      name: convertContext.escapePropertySignatureName(propertyName),
      optional: !required.includes(propertyName),
      comment: typeof property !== "boolean" ? property.description : undefined,
      struct: ToAbstractDataStructure.convert(entryPoint, currentPoint, factory, property, context, convertContext, { parent: schema }),
    };
  });
};

export const generateInterface = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  schema: ObjectSchema,
  context: ToAbstractDataStructure.Context,
  convertContext: ConvertContext.Types,
): ADS.InterfaceDeclarationStruct => {
  if (schema.type !== "object") {
    throw new FeatureDevelopmentError("Please use generateTypeAlias");
  }
  let members: (ADS.IndexSignatureStruct | ADS.PropertySignatureStruct)[] = [];
  const propertySignatures = generatePropertySignatures(entryPoint, currentPoint, factory, schema, context, convertContext);
  if (Guard.isObjectSchemaWithAdditionalProperties(schema)) {
    const additionalProperties = ToAbstractDataStructure.convertAdditionalProperties(entryPoint, currentPoint, factory, schema, context, convertContext);
    if (schema.additionalProperties === true) {
      members = members.concat(additionalProperties);
    } else {
      members = [...propertySignatures, additionalProperties];
    }
  } else {
    members = propertySignatures;
  }
  return {
    kind: "interface",
    name: convertContext.escapeDeclarationText(name),
    // comment: ExternalDocumentation.addComment(schema.description, schema.externalDocs),
    members,
  };
};

export const generateArrayTypeAlias = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  schema: ArraySchema,
  context: ToAbstractDataStructure.Context,
  convertContext: ConvertContext.Types,
): ADS.AliasStruct => {
  return {
    kind: "alias",
    name: convertContext.escapeDeclarationText(name),
    comment: schema.description,
    schema: ToAbstractDataStructure.convert(entryPoint, currentPoint, factory, schema, context, convertContext),
  };
};

export const generateTypeAlias = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  schema: PrimitiveSchema,
  convertContext: ConvertContext.Types,
): ADS.AliasStruct => {
  let type: ADS.Struct;
  if (schema.enum) {
    if (Guard.isNumberArray(schema.enum) && (schema.type === "number" || schema.type === "integer")) {
      type = {
        kind: "number",
        enum: schema.enum,
      };
    } else if (Guard.isStringArray(schema.enum) && schema.type === "string") {
      type = {
        kind: "string",
        enum: schema.enum,
      };
    } else {
      type = {
        kind: schema.type,
      };
    }
  } else {
    type = {
      kind: schema.type,
    };
  }
  return {
    kind: "alias",
    name: convertContext.escapeDeclarationText(name),
    comment: schema.description,
    schema: type,
  }
};

export const generateMultiTypeAlias = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  schemas: OpenApi.Schema[],
  context: ToAbstractDataStructure.Context,
  multiType: "oneOf" | "allOf" | "anyOf",
  convertContext: ConvertContext.Types,
): ADS.AliasStruct => {
  const schema = ToAbstractDataStructure.generateMultiTypeNode(
    entryPoint,
    currentPoint,
    factory,
    schemas,
    context,
    ToAbstractDataStructure.convert,
    convertContext,
    multiType,
  );
  return {
    kind: "alias",
    name: convertContext.escapeDeclarationText(name),
    schema: schema,
  }
};

export const addSchema = (
  entryPoint: string,
  currentPoint: string,
  store: Walker.Store,
  factory: Factory.Type,
  targetPoint: string,
  declarationName: string,
  schema: OpenApi.Schema | undefined,
  context: ToAbstractDataStructure.Context,
  convertContext: ConvertContext.Types,
): void => {
  if (!schema) {
    return;
  }
  if (Guard.isAllOfSchema(schema)) {
    store.addAbstractDataStruct(targetPoint, {
      kind: "typedef",
      name: convertContext.escapeDeclarationText(declarationName),
      struct: generateMultiTypeAlias(entryPoint, currentPoint, factory, declarationName, schema.allOf, context, "allOf", convertContext),
    });
  } else if (Guard.isOneOfSchema(schema)) {
    store.addAbstractDataStruct(targetPoint, {
      kind: "typedef",
      name: convertContext.escapeDeclarationText(declarationName),
      struct: generateMultiTypeAlias(entryPoint, currentPoint, factory, declarationName, schema.oneOf, context, "oneOf", convertContext),
    });
  } else if (Guard.isAnyOfSchema(schema)) {
    store.addAbstractDataStruct(targetPoint, {
      kind: "typedef",
      name: convertContext.escapeDeclarationText(declarationName),
      struct: generateMultiTypeAlias(entryPoint, currentPoint, factory, declarationName, schema.anyOf, context, "allOf", convertContext),
    });
  } else if (Guard.isArraySchema(schema)) {
    store.addAbstractDataStruct(targetPoint, {
      kind: "typedef",
      name: convertContext.escapeDeclarationText(declarationName),
      struct: generateArrayTypeAlias(entryPoint, currentPoint, factory, declarationName, schema, context, convertContext),
    });
  } else if (Guard.isObjectSchema(schema)) {
    store.addAbstractDataStruct(targetPoint, {
      kind: "typedef",
      name: convertContext.escapeDeclarationText(declarationName),
      struct: generateInterface(entryPoint, currentPoint, factory, declarationName, schema, context, convertContext),
    });
  } else if (Guard.isPrimitiveSchema(schema)) {
    store.addAbstractDataStruct(targetPoint, {
      kind: "typedef",
      name: convertContext.escapeDeclarationText(declarationName),
      struct: generateTypeAlias(entryPoint, currentPoint, factory, declarationName, schema, convertContext),
    });
  }
};
