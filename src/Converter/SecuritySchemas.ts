import * as ts from "typescript";
import * as Reference from "./Reference";
import * as SecuritySchema from "./SecuritySchema";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import * as Guard from "./Guard";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  requestBodies: OpenApi.MapLike<string, OpenApi.SecuritySchema | OpenApi.Reference>,
): ts.ModuleDeclaration => {
  const statements: ts.InterfaceDeclaration[] = Object.entries(requestBodies).map(([name, requestBody]) => {
    if (Guard.isReference(requestBody)) {
      const alias = Reference.generate<OpenApi.SecuritySchema | OpenApi.Reference>(entryPoint, currentPoint, requestBody);
      if (alias.internal) {
        return factory.Interface({
          name: `TODO:${requestBody.$ref}`,
          members: [],
        });
      }
      if (Guard.isReference(alias.data)) {
        throw new Error("これから");
      }
      return SecuritySchema.generateInterface(entryPoint, alias.referencePoint, factory, name, alias.data);
    }
    return SecuritySchema.generateInterface(entryPoint, currentPoint, factory, name, requestBody);
  });
  return factory.Namespace({
    export: true,
    name: "SecuritySchemas",
    statements,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#securitySchemeObject`,
  });
};
