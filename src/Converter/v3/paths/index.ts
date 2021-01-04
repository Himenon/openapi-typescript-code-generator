import { AnyARecord } from "dns";
import { Factory } from "../../../TypeScriptCodeGenerator";
import * as PathItem from "../components/PathItem";
import * as Guard from "../Guard";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";

export const generateItem = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  pathName: string,
  pathItem: OpenApi.PathItem,
  context: ToTypeNode.Context,
): string => {
  if (Guard.isReference(pathItem)) {
    return pathItem.$ref;
  }
  const parentPath = "components/pathItem";
  const name = pathName.replace(/\//g, "$");
  PathItem.generateNamespace(entryPoint, currentPoint, store, factory, parentPath, name, pathItem, context);
  return name;
};

export const generate = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  paths: OpenApi.Paths,
  context: ToTypeNode.Context,
): void => {
  Object.entries(paths).forEach(([pathName, pathItem]) => {
    generateItem(entryPoint, currentPoint, store, factory, pathName, pathItem, context);
  });
};

export const generateArgumentInterface = () => {

}