import * as ts from "typescript";
import * as Reference from "./Reference";
import * as Paramter from "./Parameter";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import * as Guard from "./Guard";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  parameters: OpenApi.MapLike<string, OpenApi.Parameter | OpenApi.Reference>,
): ts.ModuleDeclaration => {
  const interfaces = Object.entries(parameters).map(([name, parameter]) => {
    if (Guard.isReference(parameter)) {
      const alias = Reference.generate<OpenApi.MapLike<string, OpenApi.Parameter | OpenApi.Reference>>(entryPoint, currentPoint, parameter);
      if (alias.internal) {
        return factory.Interface({
          name: `TODO:${parameter.$ref}`,
          members: [],
        });
      }
      return generateNamespace(entryPoint, alias.referenceFilename, factory, alias.data);
    }
    return Paramter.generateInterface(entryPoint, currentPoint, factory, name, parameter);
  });
  return factory.Namespace({
    export: true,
    name: "Parameters",
    statements: interfaces,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#parameterObject`,
  });
};
