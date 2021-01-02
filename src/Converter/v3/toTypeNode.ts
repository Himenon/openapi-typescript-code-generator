import ts from "typescript";
import { UnsetTypeError } from "../../Exception";
import { OpenApi } from "./types";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as Reference from "./Reference";
import * as Logger from "../../Logger";
import * as Guard from "./Guard";
import { UnknownError, UnSupportError } from "../../Exception";
import { ObjectSchemaWithAdditionalProperties } from "./types";

export interface Context {
  setReference: (reference: Reference.Type<OpenApi.Schema | OpenApi.JSONSchemaDefinition>, convert: Convert) => void;
  getReferenceName: (currentPoint: string, reference: Reference.Type<OpenApi.Schema | OpenApi.JSONSchemaDefinition>) => string;
  getLocalReferenceName: (currentPoint: string, reference: Reference.Type<OpenApi.Schema | OpenApi.JSONSchemaDefinition>) => string;
}

export type Convert = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schema: OpenApi.Schema | OpenApi.Reference | OpenApi.JSONSchemaDefinition,
  setReference: Context,
  option?: Option,
) => ts.TypeNode;

export interface Option {
  parent?: any;
}

export const generateMultiTypeNode = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schemas: OpenApi.JSONSchema[],
  setReference: Context,
  convert: Convert,
  multiType: "oneOf" | "allOf" | "anyOf",
): ts.TypeNode => {
  const typeNodes = schemas.map(schema => convert(entryPoint, currentPoint, factory, schema, setReference));
  if (multiType === "oneOf") {
    return factory.UnionTypeNode({
      typeNodes,
    });
  }
  if (multiType === "allOf") {
    return factory.IntersectionTypeNode({
      typeNodes,
    });
  }
  // TODO Calculate intersection types
  return factory.TypeNode({ type: "never" });
};

export const convert: Convert = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schema: OpenApi.Schema | OpenApi.Reference | OpenApi.JSONSchemaDefinition,
  context: Context,
  option?: Option,
): ts.TypeNode => {
  if (typeof schema === "boolean") {
    // https://swagger.io/docs/specification/data-models/dictionaries/#free-form
    return factory.TypeNode({
      type: "object",
      value: [],
    });
  }
  if (Guard.isReference(schema)) {
    const reference = Reference.generate<OpenApi.Schema | OpenApi.JSONSchemaDefinition>(entryPoint, currentPoint, schema);
    if (reference.type === "local") {
      return factory.TypeReferenceNode.create({ name: context.getLocalReferenceName(currentPoint, reference) });
    }
    if (reference.componentName) {
      context.setReference(reference, convert);
      return factory.TypeReferenceNode.create({ name: context.getReferenceName(currentPoint, reference) });
    }
    return convert(entryPoint, reference.referencePoint, factory, reference.data, context, { parent: schema });
  }

  if (Guard.isOneOfSchema(schema)) {
    return generateMultiTypeNode(entryPoint, currentPoint, factory, schema.oneOf, context, convert, "oneOf");
  }
  if (Guard.isAllOfSchema(schema)) {
    return generateMultiTypeNode(entryPoint, currentPoint, factory, schema.allOf, context, convert, "allOf");
  }
  if (Guard.isAnyOfSchema(schema)) {
    return generateMultiTypeNode(entryPoint, currentPoint, factory, schema.anyOf, context, convert, "anyOf");
  }

  // schema.type
  if (!schema.type) {
    if (option && option.parent) {
      Logger.info("Parent Schema:");
      Logger.info(JSON.stringify(option.parent));
    }
    Logger.showFilePosition(entryPoint, currentPoint);
    throw new UnsetTypeError("Please set 'type' or '$ref' property \n" + JSON.stringify(schema));
  }
  switch (schema.type) {
    case "boolean":
    case "null": {
      return factory.TypeNode({
        type: schema.type,
      });
    }
    case "integer":
    case "number": {
      const items = schema.enum;
      if (items && Guard.isNumberArray(items)) {
        return factory.TypeNode({
          type: schema.type,
          enum: items,
        });
      }
      return factory.TypeNode({
        type: schema.type,
      });
    }
    case "string": {
      const items = schema.enum;
      if (items && Guard.isStringArray(items)) {
        return factory.TypeNode({
          type: schema.type,
          enum: items,
        });
      }
      return factory.TypeNode({
        type: schema.type,
      });
    }
    case "array": {
      if (Array.isArray(schema.items) || typeof schema.items === "boolean") {
        throw new UnSupportError(`schema.items = ${JSON.stringify(schema.items)}`);
      }
      return factory.TypeNode({
        type: schema.type,
        value: schema.items
          ? convert(entryPoint, currentPoint, factory, schema.items, context, { parent: schema })
          : factory.TypeNode({
              type: "undefined",
            }),
      });
    }
    case "object": {
      if (!schema.properties) {
        return factory.TypeNode({
          type: "undefined",
        });
      }
      const required: string[] = schema.required || [];
      // https://swagger.io/docs/specification/data-models/dictionaries/#free-form
      if (schema.additionalProperties === true) {
        return factory.TypeNode({
          type: schema.type,
          value: [],
        });
      }
      const value: ts.PropertySignature[] = Object.entries(schema.properties).map(([name, jsonSchema]) => {
        return factory.Property({
          name,
          type: convert(entryPoint, currentPoint, factory, jsonSchema, context, { parent: schema.properties }),
          optional: !required.includes(name),
          comment: typeof jsonSchema !== "boolean" ? jsonSchema.description : undefined,
        });
      });
      if (schema.additionalProperties) {
        const additionalProperties = factory.IndexSignature({
          name: "key",
          type: convert(entryPoint, currentPoint, factory, schema.additionalProperties, context, { parent: schema.properties }),
        });
        return factory.TypeNode({
          type: schema.type,
          value: [...value, additionalProperties],
        });
      }
      return factory.TypeNode({
        type: schema.type,
        value,
      });
    }
    default:
      throw new UnknownError("what is this?");
  }
};

export const convertAdditionalProperties = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schema: ObjectSchemaWithAdditionalProperties,
  setReference: Context,
): ts.IndexSignatureDeclaration => {
  // // https://swagger.io/docs/specification/data-models/dictionaries/#free-form
  if (schema.additionalProperties === true) {
    factory.TypeNode({
      type: schema.type,
      value: [],
    });
  }
  const additionalProperties = factory.IndexSignature({
    name: "key",
    type: convert(entryPoint, currentPoint, factory, schema.additionalProperties, setReference, { parent: schema.properties }),
  });
  return additionalProperties;
};
