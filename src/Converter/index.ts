import * as ts from "typescript";
import { UnsetTypeError } from "../Exception";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";

export const convert = (factory: Factory.Type, schema: OpenApi.Schema | OpenApi.JSONSchemaDefinition): ts.TypeNode => {
  if (typeof schema === "boolean") {
    throw new Error("わからん");
  }
  if (!schema.type) {
    throw new UnsetTypeError("Please set type");
  }
  switch (schema.type) {
    case "boolean":
    case "integer":
    case "null":
    case "number":
    case "string":
      return factory.TypeNode({
        type: schema.type,
      });
    case "array":
      if (Array.isArray(schema.items) || typeof schema.items === "boolean") {
        throw new Error("間違っている");
      }
      return factory.TypeNode({
        type: schema.type,
        value: schema.items
          ? convert(factory, schema.items)
          : factory.TypeNode({
              type: "undefined",
            }),
      });
    case "object":
      if (!schema.properties) {
        return factory.TypeNode({
          type: "undefined",
        });
      }
      // eslint-disable-next-line no-case-declarations
      const value = Object.entries(schema.properties).map(([name, jsonSchema]) => {
        return factory.Property({
          name,
          type: convert(factory, jsonSchema),
          optional: true,
        });
      });
      return factory.TypeNode({
        type: schema.type,
        value,
      });
    default:
      throw new Error("あかん");
  }
};
