import { Factory } from "../../../TypeScriptCodeGenerator";
import * as Guard from "../Guard";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";
import * as Paramter from "./Parameter";
import * as Reference from "./Reference";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  parameters: OpenApi.MapLike<string, OpenApi.Parameter | OpenApi.Reference>,
  context: ToTypeNode.Context,
): void => {
  store.addComponent("parameters", {
    type: "namespace",
    value: factory.Namespace.create({
      export: true,
      name: "Parameters",
      statements: [],
      comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#parameterObject`,
    }),
    statements: {},
  });

  Object.entries(parameters).forEach(([name, parameter]) => {
    if (Guard.isReference(parameter)) {
      const reference = Reference.generate<OpenApi.Parameter>(entryPoint, currentPoint, parameter);
      if (reference.type === "local") {
        return factory.InterfaceDeclaration.create({
          name: `TODO:${parameter.$ref}`,
          members: [],
        });
      }
      const path = `components/parameters/${reference.name}`;
      return store.addStatement(path, {
        type: "typeAlias",
        value: Paramter.generateTypeAlias(entryPoint, reference.referencePoint, factory, reference.name, reference.data, context),
      });
    }
    const path = `components/parameters/${name}`;
    return store.addStatement(path, {
      type: "typeAlias",
      value: Paramter.generateTypeAlias(entryPoint, currentPoint, factory, name, parameter, context),
    });
  });
};

export const generateNamespaceWithList = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  parameters: (OpenApi.Parameter | OpenApi.Reference)[],
  context: ToTypeNode.Context,
): void => {
  store.addComponent("parameters", {
    type: "namespace",
    value: factory.Namespace.create({
      export: true,
      name: "Parameters",
      statements: [],
      comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#parameterObject`,
    }),
    statements: {},
  });

  parameters.forEach(parameter => {
    if (Guard.isReference(parameter)) {
      const reference = Reference.generate<OpenApi.Parameter>(entryPoint, currentPoint, parameter);
      if (reference.type === "local") {
        return factory.InterfaceDeclaration.create({
          name: `TODO:${parameter.$ref}`,
          members: [],
        });
      }
      const path = `components/parameters/${reference.name}`;
      return store.addStatement(path, {
        type: "typeAlias",
        value: Paramter.generateTypeAlias(entryPoint, reference.referencePoint, factory, reference.data.name, reference.data, context),
      });
    }
    const path = `components/parameters/${parameter.name}`;
    return store.addStatement(path, {
      type: "typeAlias",
      value: Paramter.generateTypeAlias(entryPoint, currentPoint, factory, parameter.name, parameter, context),
    });
  });
};