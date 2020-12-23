import * as ts from "typescript";
import { UnsetTypeError } from "../Exception";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import { isReference } from "./Guard";
import * as Reference from "./Reference";

export const convert = (
  entryFilename: string,
  referenceFilename: string,
  factory: Factory.Type,
  schema: OpenApi.Schema | OpenApi.Reference | OpenApi.JSONSchemaDefinition,
): ts.TypeNode => {
  console.log({ entryFilename, referenceFilename })
  if (typeof schema === "boolean") {
    throw new Error("わからん");
  }
  if (isReference(schema)) {
    const alias = Reference.generate<OpenApi.Schema | OpenApi.Reference | OpenApi.JSONSchemaDefinition>(entryFilename, referenceFilename, schema);
    if (alias.internal) {
      throw new Error("これから対応");
    }
    console.log("探索した");
    return convert(entryFilename, alias.referenceFilename, factory, alias.data);
  }
  if (!schema.type) {
    throw new UnsetTypeError("Please set type or $ref " + JSON.stringify(schema));
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
          ? convert(entryFilename, referenceFilename, factory, schema.items)
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
          type: convert(entryFilename, referenceFilename,factory, jsonSchema),
          optional: true,
          comment: typeof jsonSchema !== "boolean" ? jsonSchema.description : undefined,
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
