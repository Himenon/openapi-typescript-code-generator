import ts from "typescript";

import { TsGenerator } from "../api";
import type { OpenApi } from "../types";
import { OpenApiType } from "../utils";

const factory = TsGenerator.factory;

export class Convert {
  public static generateMultiTypeNode(schemas: OpenApi.JSONSchema[], multiType: "oneOf" | "allOf" | "anyOf"): ts.TypeNode {
    const typeNodes = schemas.map(schema => this.generateTypeNode(schema));
    if (multiType === "oneOf") {
      return factory.UnionTypeNode.create({
        typeNodes,
      });
    }
    if (multiType === "allOf") {
      return factory.IntersectionTypeNode.create({
        typeNodes,
      });
    }
    // TODO Feature Development: Calculate intersection types
    return factory.TypeNode.create({ type: "never" });
  }

  public static generateTypeNode(schema: OpenApi.Schema | OpenApi.Reference | OpenApi.JSONSchemaDefinition): ts.TypeNode {
    if (typeof schema === "boolean") {
      // https://swagger.io/docs/specification/data-models/dictionaries/#free-form
      return factory.TypeNode.create({
        type: "object",
        value: [],
      });
    }

    if (OpenApiType.Guard.isReference(schema)) {
      return factory.TypeNode.create({
        type: "any",
      });
    }

    if (OpenApiType.Guard.isOneOfSchema(schema)) {
      return this.generateMultiTypeNode(schema.oneOf, "oneOf");
    }
    if (OpenApiType.Guard.isAllOfSchema(schema)) {
      return this.generateMultiTypeNode(schema.allOf, "allOf");
    }
    if (OpenApiType.Guard.isAnyOfSchema(schema)) {
      return this.generateMultiTypeNode(schema.anyOf, "anyOf");
    }
    if (OpenApiType.Guard.isHasNoMembersObject(schema)) {
      return factory.TypeNode.create({
        type: "object",
        value: [],
      });
    }
    return this.generateTypeNode2(schema);
  }

  public static generateTypeNode2(schema: OpenApi.Schema | OpenApi.JSONSchema) {
    switch (schema.type) {
      case "boolean": {
        const typeNode = factory.TypeNode.create({
          type: "boolean",
        });

        return this.nullable(typeNode, !!schema.nullable);
      }
      case "null": {
        return factory.TypeNode.create({
          type: schema.type,
        });
      }
      case "integer":
      case "number": {
        const items = schema.enum;
        let typeNode: ts.TypeNode;
        if (items && OpenApiType.Guard.isNumberArray(items)) {
          typeNode = factory.TypeNode.create({
            type: schema.type,
            enum: items,
          });
        } else {
          typeNode = factory.TypeNode.create({
            type: schema.type,
          });
        }
        return this.nullable(typeNode, !!schema.nullable);
      }
      case "string": {
        const items = schema.enum;
        let typeNode: ts.TypeNode;
        if (items && OpenApiType.Guard.isStringArray(items)) {
          typeNode = factory.TypeNode.create({
            type: schema.type,
            enum: items,
          });
        } else {
          typeNode = factory.TypeNode.create({
            type: schema.type,
          });
        }
        return this.nullable(typeNode, !!schema.nullable);
      }
      case "array": {
        if (Array.isArray(schema.items) || typeof schema.items === "boolean") {
          throw new Error(`schema.items = ${JSON.stringify(schema.items)}`);
        }
        const typeNode = factory.TypeNode.create({
          type: schema.type,
          value: schema.items
            ? this.generateTypeNode(schema.items)
            : factory.TypeNode.create({
                type: "undefined",
              }),
        });
        return this.nullable(typeNode, !!schema.nullable);
      }
      case "object": {
        const required: string[] = schema.required || [];
        // // https://swagger.io/docs/specification/data-models/dictionaries/#free-form
        if (schema.additionalProperties === true) {
          return factory.TypeNode.create({
            type: schema.type,
            value: [],
          });
        }
        const value: ts.PropertySignature[] = Object.entries(schema.properties || {}).map(([name, jsonSchema]) => {
          return factory.PropertySignature.create({
            name: name + "TODO",
            type: this.generateTypeNode(jsonSchema),
            optional: !required.includes(name),
            comment: typeof jsonSchema !== "boolean" ? jsonSchema.description : undefined,
          });
        });
        if (schema.additionalProperties) {
          const additionalProperties = factory.IndexSignatureDeclaration.create({
            name: "key",
            type: this.generateTypeNode(schema.additionalProperties),
          });
          return factory.TypeNode.create({
            type: schema.type,
            value: [...value, additionalProperties],
          });
        }
        const typeNode = factory.TypeNode.create({
          type: schema.type,
          value,
        });
        return this.nullable(typeNode, !!schema.nullable);
      }
      default:
        break;
    }
    return factory.TypeNode.create({
      type: "any",
    });
  }

  public static nullable = (typeNode: ts.TypeNode, nullable: boolean): ts.TypeNode => {
    if (nullable) {
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
}
