import type { OpenApi } from "../../../types";
import { FeatureDevelopmentError, UnSupportError } from "../../Exception";
import { Factory } from "../../TsGenerator";
import * as ConverterContext from "../ConverterContext";
import * as Guard from "../Guard";
import * as Name from "../Name";
import * as ToTypeNode from "../toTypeNode";
import type * as Walker from "../Walker";
import * as PathItem from "./PathItem";
import * as Reference from "./Reference";

// 使わない可能性あり
export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Walker.Store,
  factory: Factory.Type,
  pathItems: Record<string, OpenApi.PathItem | OpenApi.Reference>,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): void => {
  const basePath = "components/pathItems";

  store.addComponent("pathItems", {
    kind: "namespace",
    name: Name.Components.PathItems,
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
        PathItem.generateNamespace(
          entryPoint,
          reference.referencePoint,
          store,
          factory,
          basePath,
          reference.name,
          reference.data,
          context,
          converterContext,
        );
      } else {
        throw new FeatureDevelopmentError("存在しないReferenceを参照する場合は全部生成する");
      }
    } else {
      PathItem.generateNamespace(entryPoint, currentPoint, store, factory, basePath, key, pathItem, context, converterContext);
    }
  });
};
