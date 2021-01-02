import { Factory } from "../../TypeScriptCodeGenerator";
import * as Operation from "./Operation";
import * as Parameters from "./Parameters";
import * as Servers from "./Servers";
import { Store } from "./store";
import * as ToTypeNode from "./toTypeNode";
import { OpenApi } from "./types";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  parentPath: string,
  name: string,
  pathItem: OpenApi.PathItem,
  context: ToTypeNode.Context,
): void => {
  const basePath = `${parentPath}/${name}`;
  store.addStatement(basePath, {
    type: "namespace",
    value: factory.Namespace.create({
      export: true,
      name,
      statements: [],
      comment: Servers.addComment(pathItem.description, pathItem.servers),
    }),
    statements: {},
  });
  if (pathItem.get) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "GET", pathItem.get, context);
  }
  if (pathItem.put) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "PUT", pathItem.put, context);
  }
  if (pathItem.post) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "POST", pathItem.post, context);
  }
  if (pathItem.delete) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "DELETE", pathItem.delete, context);
  }
  if (pathItem.options) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "OPTIONS", pathItem.options, context);
  }
  if (pathItem.head) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "HEAD", pathItem.head, context);
  }
  if (pathItem.patch) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "PATCH", pathItem.patch, context);
  }
  if (pathItem.trace) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "TRACE", pathItem.trace, context);
  }
  if (pathItem.parameters) {
    Parameters.generateNamespaceWithList(entryPoint, currentPoint, store, factory, pathItem.parameters, context);
  }
};
