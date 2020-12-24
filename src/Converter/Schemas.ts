import * as ts from "typescript";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
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
        throw new Error("これから" + alias.name);
      }
      return factory.Interface({
        export: true,
        name,
        members: Schema.generatePropertySignatures(entryPoint, alias.referenceFilename, factory, alias.data),
        comment: schema.description,
      });
    }
    return Schema.generateInterface(entryPoint, currentPoint, factory, name, schema);
  });
  return factory.Namespace({
    export: true,
    name: "Components",
    statements: interfaces,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#schemaObject`,
  });
};
