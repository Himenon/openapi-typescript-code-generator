import * as ts from "typescript";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import { UnsetTypeError, UnSupportError } from "../Exception";
import * as ToTypeNode from "./toTypeNode";

export const generate = (factory: Factory.Type, schemas: OpenApi.MapLike<string, OpenApi.Schema>): ts.ModuleDeclaration => {
  const interfaces = Object.entries(schemas).map(([name, schema]) => {
    if (schema.type !== "object") {
      throw new UnSupportError("");
    }
    if (!schema.properties) {
      throw new UnsetTypeError("schema.properties");
    }
    const members = Object.entries(schema.properties).map(([propertyName, property]) => {
      return factory.Property({
        name: propertyName,
        type: ToTypeNode.convert(factory, property),
        comment: typeof property !== "boolean" ? property.description : undefined,
      });
    });
    return factory.Interface({
      export: true,
      name,
      members,
      comment: schema.description,
    });
  });
  return factory.Namespace({
    export: true,
    name: "Components",
    statements: interfaces,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#schemaObject`,
  });
};
