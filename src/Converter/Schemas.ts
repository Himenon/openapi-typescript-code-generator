import ts from "typescript";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import { FeatureDevelopmentError, UnSupportError } from "../Exception";
import * as Guard from "./Guard";
import * as Reference from "./Reference";
import * as Schema from "./Schema";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schemas: OpenApi.MapLike<string, OpenApi.Schema | OpenApi.Reference>,
): ts.ModuleDeclaration => {
  const interfaces = Object.entries(schemas).map(([name, schema]) => {
    if (Guard.isReference(schema)) {
      const alias = Reference.generate<OpenApi.Schema | OpenApi.Reference>(entryPoint, currentPoint, schema);
      if (alias.internal) {
        throw new FeatureDevelopmentError("これから" + alias.name);
      }
      if (Guard.isReference(alias.data)) {
        throw new FeatureDevelopmentError("aliasの先がaliasだった場合");
      }
      if (Guard.isObjectSchema(alias.data)) {
        return Schema.generateInterface(entryPoint, alias.referencePoint, factory, name, alias.data);
      }
      if (Guard.isPrimitiveSchema(alias.data)) {
        return Schema.generateTypeAlias(entryPoint, alias.referencePoint, factory, name, alias.data);
      }
      throw new UnSupportError("schema.type = Array[] not supported.");
    }
    if (Guard.isObjectSchema(schema)) {
      return Schema.generateInterface(entryPoint, currentPoint, factory, name, schema);
    }
    if (Guard.isObjectSchema(schema)) {
      return Schema.generateInterface(entryPoint, currentPoint, factory, name, schema);
    }
    if (Guard.isPrimitiveSchema(schema)) {
      return Schema.generateTypeAlias(entryPoint, currentPoint, factory, name, schema);
    }
    throw new UnSupportError("schema.type = Array[] not supported.");
  });
  return factory.Namespace({
    export: true,
    name: "Components",
    statements: interfaces,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#schemaObject`,
  });
};
