import type { OpenApi } from "../../../types";
import { UnSupportError } from "../../Exception";
import { Factory } from "../../TsGenerator";
import * as ConverterContext from "../ConverterContext";
import * as Guard from "../Guard";
import * as Name from "../Name";
import * as ToTypeNode from "../toTypeNode";
import type * as Walker from "../Walker";
import * as Paramter from "./Parameter";
import * as Reference from "./Reference";
import * as Schema from "./Schema";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Walker.Store,
  factory: Factory.Type,
  parameters: Record<string, OpenApi.Parameter | OpenApi.Reference>,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): void => {
  const basePath = "components/parameters";
  store.addComponent("parameters", {
    kind: "namespace",
    name: Name.Components.Parameters,
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
        Schema.addSchema(
          entryPoint,
          currentPoint,
          store,
          factory,
          reference.path,
          reference.name,
          reference.data.schema,
          context,
          converterContext,
        );
        store.addStatement(`${basePath}/${name}`, {
          kind: "typeAlias",
          name: converterContext.escapeDeclarationText(name),
          value: factory.TypeAliasDeclaration.create({
            export: true,
            name: converterContext.escapeDeclarationText(name),
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
        name: converterContext.escapeDeclarationText(name),
        value: Paramter.generateTypeAlias(entryPoint, currentPoint, factory, name, parameter, context, converterContext),
      });
    }
  });
};

export const generateNamespaceWithList = (
  entryPoint: string,
  currentPoint: string,
  store: Walker.Store,
  factory: Factory.Type,
  parameters: (OpenApi.Parameter | OpenApi.Reference)[],
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): void => {
  store.addComponent("parameters", {
    kind: "namespace",
    name: Name.Components.Parameters,
  });

  parameters.forEach((parameter) => {
    if (Guard.isReference(parameter)) {
      const reference = Reference.generate<OpenApi.Parameter>(entryPoint, currentPoint, parameter);
      if (reference.type === "local") {
        throw new UnSupportError("What is components.parameters local reference?");
      }
      const path = `components/parameters/${reference.name}`;
      return store.addStatement(path, {
        kind: "typeAlias",
        name: reference.name,
        value: Paramter.generateTypeAlias(
          entryPoint,
          reference.referencePoint,
          factory,
          reference.name,
          reference.data,
          context,
          converterContext,
        ),
      });
    }
    const path = `components/parameters/${parameter.name}`;
    return store.addStatement(path, {
      kind: "typeAlias",
      name: parameter.name,
      value: Paramter.generateTypeAlias(entryPoint, currentPoint, factory, parameter.name, parameter, context, converterContext),
    });
  });
};
