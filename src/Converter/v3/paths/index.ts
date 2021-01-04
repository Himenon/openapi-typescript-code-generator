import { FeatureDevelopmentError } from "../../../Exception";
import { Factory } from "../../../TypeScriptCodeGenerator";
import * as PathItem from "../components/PathItem";
import * as Reference from "../components/Reference";
import * as Guard from "../Guard";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  paths: OpenApi.Paths,
  context: ToTypeNode.Context,
): void => {
  Object.entries(paths).forEach(([pathName, pathItem], index) => {
    if (!pathName.startsWith("/")) {
      throw new Error(`Not start slash: ${pathName}`);
    }
    const pathIdentifer = `Path$${index + 1}`;
    if (Guard.isReference(pathItem)) {
      const reference = Reference.generate<OpenApi.PathItem>(entryPoint, currentPoint, pathItem);
      if (reference.type === "local") {
        throw new FeatureDevelopmentError("これから対応");
      }
      PathItem.generateNamespace(
        entryPoint,
        reference.referencePoint,
        store,
        factory,
        "components/pathItems",
        pathIdentifer,
        reference.data,
        context,
        { topComment: `Endpoint: ${pathName}` },
      );
    } else {
      PathItem.generateNamespace(entryPoint, currentPoint, store, factory, "components/pathItems", pathIdentifer, pathItem, context, {
        topComment: `Endpoint: ${pathName}`,
      });
    }
  });
};
