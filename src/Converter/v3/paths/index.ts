import ts from "typescript";

import { FeatureDevelopmentError } from "../../../Exception";
import { Factory } from "../../../TypeScriptCodeGenerator";
import * as PathItem from "../components/PathItem";
import * as Reference from "../components/Reference";
import * as Guard from "../Guard";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";

export * as Arguments from "./Arguments";

export const generateStatements = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  paths: OpenApi.Paths,
  context: ToTypeNode.Context,
): void => {
  const statements: ts.Statement[][] = [];
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
      statements.push(
        PathItem.generateStatements(
          entryPoint,
          reference.referencePoint,
          store,
          factory,
          "components/pathItems",
          pathIdentifer,
          reference.data,
          context,
        ),
      );
    } else {
      statements.push(
        PathItem.generateStatements(entryPoint, currentPoint, store, factory, "components/pathItems", pathIdentifer, pathItem, context),
      );
    }
  });
  store.addAdditionalStatement(statements.flat());
};
