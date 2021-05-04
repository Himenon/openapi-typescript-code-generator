import type { OpenApi } from "../../../types";
import * as ADS from "../../AbstractDataStructure";
import { FeatureDevelopmentError } from "../../Exception";
import * as Guard from "../Guard";
import * as ToAbstractDataStructure from "../toAbstractDataStructure";
import type { ArraySchema, ObjectSchema, PrimitiveSchema } from "../types";
import type { Payload } from "../types/tmp";
import type * as Walker from "../Walker2";

export const generatePropertySignatures = (payload: Payload, schema: ObjectSchema): ADS.PropertySignatureStruct[] => {
  const { converterContext } = payload;
  if (!schema.properties) {
    return [];
  }
  const required: string[] = schema.required || [];
  return Object.entries(schema.properties).map<ADS.PropertySignatureStruct>(([propertyName, property]) => {
    if (!property) {
      return {
        kind: "PropertySignature",
        name: converterContext.escapePropertySignatureName(propertyName),
        optional: !required.includes(propertyName),
        comment: schema.description,
        struct: {
          kind: "any",
        },
      };
    }
    return {
      kind: "PropertySignature",
      name: converterContext.escapePropertySignatureName(propertyName),
      optional: !required.includes(propertyName),
      comment: typeof property !== "boolean" ? property.description : undefined,
      struct: ToAbstractDataStructure.convert(payload, property, { parent: schema }),
    };
  });
};

export const generateInterface = (payload: Payload, name: string, schema: ObjectSchema): ADS.InterfaceDeclarationStruct => {
  const { converterContext } = payload;
  if (schema.type !== "object") {
    throw new FeatureDevelopmentError("Please use generateTypeAlias");
  }
  let members: (ADS.IndexSignatureStruct | ADS.PropertySignatureStruct)[] = [];
  const propertySignatures = generatePropertySignatures(payload, schema);
  if (Guard.isObjectSchemaWithAdditionalProperties(schema)) {
    const additionalProperties = ToAbstractDataStructure.convertAdditionalProperties(payload, schema);
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
    name: converterContext.escapeDeclarationText(name),
    // comment: ExternalDocumentation.addComment(schema.description, schema.externalDocs),
    members,
  };
};

export const generateArrayTypeAlias = (payload: Payload, name: string, schema: ArraySchema): ADS.ArrayStruct => {
  return {
    kind: "array",
    struct: ToAbstractDataStructure.convert(payload, schema),
  };
};

export const generateTypeLiteral = (payload: Payload, name: string, schema: PrimitiveSchema): ADS.TypeLiteralStruct => {
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
    kind: "typeLiteral",
    struct: type,
  };
};

export const generateMultiTypeAlias = (
  payload: Payload,
  name: string,
  schemas: OpenApi.Schema[],
  multiType: "oneOf" | "allOf" | "anyOf",
): ADS.UnionStruct | ADS.IntersectionStruct | ADS.NeverStruct => {
  return ToAbstractDataStructure.generateMultiTypeNode(payload, schemas, ToAbstractDataStructure.convert, multiType);
};

export const addSchema = (
  payload: Payload,
  store: Walker.Store,
  targetPoint: string,
  declarationName: string,
  schema: OpenApi.Schema | undefined,
): void => {
  if (!schema) {
    return;
  }
  if (Guard.isAllOfSchema(schema)) {
    store.addAbstractDataStruct(targetPoint, {
      kind: "typedef",
      name: payload.converterContext.escapeDeclarationText(declarationName),
      struct: generateMultiTypeAlias(payload, declarationName, schema.allOf, "allOf"),
    });
  } else if (Guard.isOneOfSchema(schema)) {
    store.addAbstractDataStruct(targetPoint, {
      kind: "typedef",
      name: payload.converterContext.escapeDeclarationText(declarationName),
      struct: generateMultiTypeAlias(payload, declarationName, schema.oneOf, "oneOf"),
    });
  } else if (Guard.isAnyOfSchema(schema)) {
    store.addAbstractDataStruct(targetPoint, {
      kind: "typedef",
      name: payload.converterContext.escapeDeclarationText(declarationName),
      struct: generateMultiTypeAlias(payload, declarationName, schema.anyOf, "allOf"),
    });
  } else if (Guard.isArraySchema(schema)) {
    store.addAbstractDataStruct(targetPoint, {
      kind: "typedef",
      name: payload.converterContext.escapeDeclarationText(declarationName),
      struct: generateArrayTypeAlias( payload, declarationName, schema),
    });
  } else if (Guard.isObjectSchema(schema)) {
    store.addAbstractDataStruct(targetPoint, {
      kind: "typedef",
      name: payload.converterContext.escapeDeclarationText(declarationName),
      struct: generateInterface(payload, declarationName, schema),
    });
  } else if (Guard.isPrimitiveSchema(schema)) {
    store.addAbstractDataStruct(targetPoint, {
      kind: "typedef",
      name: payload.converterContext.escapeDeclarationText(declarationName),
      struct: generateTypeLiteral(payload, declarationName, schema),
    });
  }
};
