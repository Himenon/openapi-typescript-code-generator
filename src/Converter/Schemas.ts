import * as ts from "typescript";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import { UnsetTypeError, UnSupportError } from "../Exception";
import * as ToTypeNode from "./toTypeNode";
import * as Guard from "./Guard";
import * as Reference from "./Reference";

const generateMembers = (entryFilename: string, referenceFilename: string, factory: Factory.Type, schema: OpenApi.Schema) => {
  if (schema.type !== "object") {
    throw new UnSupportError(JSON.stringify(schema));
  }
  if (!schema.properties) {
    throw new UnsetTypeError("schema.properties");
  }
  return Object.entries(schema.properties).map(([propertyName, property]) => {
    return factory.Property({
      name: propertyName,
      type: ToTypeNode.convert(entryFilename, referenceFilename, factory, property),
      comment: typeof property !== "boolean" ? property.description : undefined,
    });
  });
};

export const generate = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schemas: OpenApi.MapLike<string, OpenApi.Schema | OpenApi.Reference>,
): ts.ModuleDeclaration => {
  const interfaces = Object.entries(schemas).map(([name, schema]) => {
    if (Guard.isReference(schema)) {
      const alias = Reference.generate<OpenApi.Schema | OpenApi.Reference>(entryPoint, currentPoint, schema);
      if (alias.internal) {
        throw new Error("これから" + alias.name);
      }
      const members = generateMembers(entryPoint, alias.referenceFilename, factory, alias.data);
      return factory.Interface({
        export: true,
        name,
        members,
        comment: schema.description,
      });
    }
    const members = generateMembers(entryPoint, currentPoint, factory, schema);
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
