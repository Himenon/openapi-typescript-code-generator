import ts from "typescript";
import { UnsetTypeError } from "../Exception";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import { isReference } from "./Guard";
import * as Reference from "./Reference";
import * as Logger from "../Logger";
import * as Guard from "./Guard";
import { UnknownError } from "../Exception";
import { ObjectSchemaWithAdditionalProperties } from "./types";

export interface Option {
  parent?: any;
}

export const convert = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schema: OpenApi.Schema | OpenApi.Reference | OpenApi.JSONSchemaDefinition,
  option?: Option,
): ts.TypeNode => {
  if (typeof schema === "boolean") {
    // https://swagger.io/docs/specification/data-models/dictionaries/#free-form
    return factory.TypeNode({
      type: "object",
      value: [],
    });
  }
  if (isReference(schema)) {
    const alias = Reference.generate<OpenApi.Schema | OpenApi.Reference | OpenApi.JSONSchemaDefinition>(entryPoint, currentPoint, schema);
    if (alias.internal) {
      throw new Error("これから対応");
    }
    return convert(entryPoint, alias.referencePoint, factory, alias.data, { parent: schema });
  }
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
        throw new Error("間違っている");
      }
      return factory.TypeNode({
        type: schema.type,
        value: schema.items
          ? convert(entryPoint, currentPoint, factory, schema.items, { parent: schema })
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
      const value = Object.entries(schema.properties).map(([name, jsonSchema]) => {
        return factory.Property({
          name,
          type: convert(entryPoint, currentPoint, factory, jsonSchema, { parent: schema.properties }),
          optional: !required.includes(name),
          comment: typeof jsonSchema !== "boolean" ? jsonSchema.description : undefined,
        });
      });
      if (schema.additionalProperties) {
        const additionalProperties = factory.IndexSignature({
          name: "key",
          type: convert(entryPoint, currentPoint, factory, schema.additionalProperties, { parent: schema.properties }),
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
    type: convert(entryPoint, currentPoint, factory, schema.additionalProperties, { parent: schema.properties }),
  });
  return additionalProperties;
};
