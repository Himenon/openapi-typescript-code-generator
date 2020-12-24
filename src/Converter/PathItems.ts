import * as ts from "typescript";
import * as Reference from "./Reference";
import * as PathItem from "./PathItem";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import * as Guard from "./Guard";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  pathItems: OpenApi.MapLike<string, OpenApi.PathItem | OpenApi.Reference>,
): ts.ModuleDeclaration => {
  const statements: ts.ModuleDeclaration[] = Object.entries(pathItems).map(([pathName, pathItem]) => {
    const name = pathName.replace("/", "$");
    if (Guard.isReference(pathItem)) {
      const alias = Reference.generate<OpenApi.PathItem | OpenApi.Reference>(entryPoint, currentPoint, pathItem);
      if (alias.internal) {
        throw new Error("これから");
      }
      if (Guard.isReference(alias.data)) {
        throw new Error("これから");
      }
      return PathItem.generateNamespace(entryPoint, alias.referencePoint, factory, name, alias.data);
    }
    return PathItem.generateNamespace(entryPoint, currentPoint, factory, name, pathItem);
  });
  return factory.Namespace({
    export: true,
    name: "PathItems",
    statements,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#componentsObject`,
  });
};
