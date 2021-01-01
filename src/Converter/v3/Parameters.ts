import * as Reference from "./Reference";
import * as Paramter from "./Parameter";
import { OpenApi } from "./types";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as Guard from "./Guard";
import { Store } from "./store";
import * as ToTypeNode from "./toTypeNode";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  parameters: OpenApi.MapLike<string, OpenApi.Parameter | OpenApi.Reference>,
  setReference: ToTypeNode.SetReferenceCallback,
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
        return factory.Interface({
          name: `TODO:${parameter.$ref}`,
          members: [],
        });
      }
      const path = `components/parameters/${reference.name}`;
      return store.addStatement(path, {
        type: "interface",
        value: Paramter.generateInterface(entryPoint, reference.referencePoint, factory, reference.name, reference.data, setReference),
      });
    }
    const path = `components/parameters/${name}`;
    return store.addStatement(path, {
      type: "interface",
      value: Paramter.generateInterface(entryPoint, currentPoint, factory, name, parameter, setReference),
    });
  });
};

export const generateNamespaceWithList = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  parameters: (OpenApi.Parameter | OpenApi.Reference)[],
  setReference: ToTypeNode.SetReferenceCallback,
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
        return factory.Interface({
          name: `TODO:${parameter.$ref}`,
          members: [],
        });
      }
      const path = `components/parameters/${reference.name}`;
      return store.addStatement(path, {
        type: "interface",
        value: Paramter.generateInterface(entryPoint, reference.referencePoint, factory, reference.data.name, reference.data, setReference),
      });
    }
    const path = `components/parameters/${parameter.name}`;
    return store.addStatement(path, {
      type: "interface",
      value: Paramter.generateInterface(entryPoint, currentPoint, factory, parameter.name, parameter, setReference),
    });
  });
};
