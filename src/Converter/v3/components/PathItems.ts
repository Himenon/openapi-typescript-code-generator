import { FeatureDevelopmentError, UnSupportError } from "../../../Exception";
import { Factory } from "../../../TypeScriptCodeGenerator";
import * as Guard from "../Guard";
import * as Name from "../Name";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";
import * as PathItem from "./PathItem";
import * as Reference from "./Reference";

// 使わない可能性あり
export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  pathItems: OpenApi.MapLike<string, OpenApi.PathItem | OpenApi.Reference>,
  context: ToTypeNode.Context,
): void => {
  const basePath = "components/pathItems";

  store.addComponent("pathItems", {
    type: "namespace",
    name: Name.Components.PathItems,
    value: factory.Namespace.create({
      export: true,
      name: Name.Components.PathItems,
      statements: [],
      comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#componentsObject`,
    }),
    statements: {},
  });

  Object.entries(pathItems).forEach(([key, pathItem]) => {
    if (Guard.isReference(pathItem)) {
      const reference = Reference.generate<OpenApi.PathItem>(entryPoint, currentPoint, pathItem);
      if (reference.type === "local") {
        throw new UnSupportError("can't use components.pathItems local reference");
      } else if (reference.componentName) {
        if (key !== reference.name) {
          throw new UnSupportError(`can't use difference pathItem key name. "${key}" !== "${reference.name}"`);
        }
        PathItem.generateNamespace(entryPoint, reference.referencePoint, store, factory, basePath, reference.name, reference.data, context);
      } else {
        throw new FeatureDevelopmentError("存在しないReferenceを参照する場合は全部生成する");
      }
    } else {
      PathItem.generateNamespace(entryPoint, currentPoint, store, factory, basePath, key, pathItem, context);
    }
  });
};
