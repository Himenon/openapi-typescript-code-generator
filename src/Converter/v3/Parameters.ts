import ts from "typescript";
import * as Reference from "./Reference";
import * as Paramter from "./Parameter";
import { OpenApi } from "./types";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as Guard from "./Guard";
import { Store } from "./store";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  parameters: OpenApi.MapLike<string, OpenApi.Parameter | OpenApi.Reference>,
): ts.ModuleDeclaration => {
  const statements: ts.InterfaceDeclaration[] = Object.entries(parameters).map(([name, parameter]) => {
    if (Guard.isReference(parameter)) {
      const alias = Reference.generate<OpenApi.Parameter | OpenApi.Reference>(entryPoint, currentPoint, parameter);
      if (alias.internal) {
        return factory.Interface({
          name: `TODO:${parameter.$ref}`,
          members: [],
        });
      }
      if (Guard.isReference(alias.data)) {
        throw new Error("これから");
      }
      return Paramter.generateInterface(entryPoint, alias.referencePoint, factory, name, alias.data);
    }
    return Paramter.generateInterface(entryPoint, currentPoint, factory, name, parameter);
  });
  return factory.Namespace({
    export: true,
    name: "Parameters",
    statements,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#parameterObject`,
  });
};

export const generateNamespaceWithList = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  parameters: (OpenApi.Parameter | OpenApi.Reference)[],
): ts.ModuleDeclaration => {
  const statements: ts.InterfaceDeclaration[] = parameters.map(parameter => {
    if (Guard.isReference(parameter)) {
      const alias = Reference.generate<OpenApi.Parameter | OpenApi.Reference>(entryPoint, currentPoint, parameter);
      if (alias.internal) {
        return factory.Interface({
          name: `TODO:${parameter.$ref}`,
          members: [],
        });
      }
      if (Guard.isReference(alias.data)) {
        throw new Error("これから");
      }
      return Paramter.generateInterface(entryPoint, alias.referencePoint, factory, alias.data.name, alias.data);
    }
    return Paramter.generateInterface(entryPoint, currentPoint, factory, parameter.name, parameter);
  });
  return factory.Namespace({
    export: true,
    name: "Parameters",
    statements,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#parameterObject`,
  });
};
