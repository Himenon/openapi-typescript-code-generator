import * as Reference from "./Reference";
import * as PathItem from "./PathItem";
import { OpenApi } from "./types";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as Guard from "./Guard";
import { Store } from "./store";
import * as ToTypeNode from "./toTypeNode";
import { FeatureDevelopmentError } from "../../Exception";

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
    value: factory.Namespace.create({
      export: true,
      name: "PathItems",
      statements: [],
      comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#componentsObject`,
    }),
    statements: {},
  });

  Object.entries(pathItems).forEach(([pathName, pathItem]) => {
    const name = pathName.replace("/", "$");
    if (Guard.isReference(pathItem)) {
      const reference = Reference.generate<OpenApi.PathItem>(entryPoint, currentPoint, pathItem);
      if (reference.type === "local") {
        throw new FeatureDevelopmentError("reference対応");
      }
      return PathItem.generateNamespace(
        entryPoint,
        reference.referencePoint,
        store,
        factory,
        basePath,
        reference.name,
        reference.data,
        context,
      );
    }
    return PathItem.generateNamespace(entryPoint, currentPoint, store, factory, basePath, name, pathItem, context);
  });
};
