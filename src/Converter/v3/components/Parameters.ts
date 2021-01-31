import { Factory } from "../../../CodeGenerator";
import { UnSupportError } from "../../../Exception";
import * as Guard from "../Guard";
import * as Name from "../Name";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";
import * as Paramter from "./Parameter";
import * as Reference from "./Reference";
import * as Schema from "./Schema";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  parameters: Record<string, OpenApi.Parameter | OpenApi.Reference>,
  context: ToTypeNode.Context,
): void => {
  const basePath = "components/parameters";
  store.addComponent("parameters", {
    kind: "namespace",
    name: Name.Components.Parameters,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#parameterObject`,
  });

  Object.entries(parameters).forEach(([name, parameter]) => {
    if (Guard.isReference(parameter)) {
      const reference = Reference.generate<OpenApi.Parameter>(entryPoint, currentPoint, parameter);
      if (reference.type === "local") {
        throw new UnSupportError("What is components.parameters local reference?");
      } else {
        if (!reference.data.schema) {
          return;
        }
        Schema.addSchema(entryPoint, currentPoint, store, factory, reference.path, reference.name, reference.data.schema, context);
        store.addStatement(`${basePath}/${name}`, {
          kind: "typeAlias",
          name: name,
          value: factory.TypeAliasDeclaration.create({
            export: true,
            name: name,
            type: factory.TypeReferenceNode.create({
              name: context.resolveReferencePath(currentPoint, reference.path).name,
            }),
          }),
        });
      }
    } else {
      const path = `${basePath}/${name}`;
      store.addStatement(path, {
        kind: "typeAlias",
        name: name,
        value: Paramter.generateTypeAlias(entryPoint, currentPoint, factory, name, parameter, context),
      });
    }
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
    kind: "namespace",
    name: Name.Components.Parameters,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#parameterObject`,
  });

  parameters.forEach(parameter => {
    if (Guard.isReference(parameter)) {
      const reference = Reference.generate<OpenApi.Parameter>(entryPoint, currentPoint, parameter);
      if (reference.type === "local") {
        throw new UnSupportError("What is components.parameters local reference?");
      }
      const path = `components/parameters/${reference.name}`;
      return store.addStatement(path, {
        kind: "typeAlias",
        name: reference.name,
        value: Paramter.generateTypeAlias(entryPoint, reference.referencePoint, factory, reference.name, reference.data, context),
      });
    }
    const path = `components/parameters/${parameter.name}`;
    return store.addStatement(path, {
      kind: "typeAlias",
      name: parameter.name,
      value: Paramter.generateTypeAlias(entryPoint, currentPoint, factory, parameter.name, parameter, context),
    });
  });
};
