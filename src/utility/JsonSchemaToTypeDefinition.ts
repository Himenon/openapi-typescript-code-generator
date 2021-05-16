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

    return factory.TypeNode.create({
      type: "any",
    });
  }
}
