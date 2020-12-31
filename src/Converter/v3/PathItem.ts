import { OpenApi } from "./types";
import * as Parameters from "./Parameters";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as Operation from "./Operation";
import * as Servers from "./Servers";
import { Store } from "./store";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  parentPath: string,
  name: string,
  pathItem: OpenApi.PathItem,
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
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "GET", pathItem.get);
  }
  if (pathItem.put) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "PUT", pathItem.put);
  }
  if (pathItem.post) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "POST", pathItem.post);
  }
  if (pathItem.delete) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "DELETE", pathItem.delete);
  }
  if (pathItem.options) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "OPTIONS", pathItem.options);
  }
  if (pathItem.head) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "HEAD", pathItem.head);
  }
  if (pathItem.patch) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "PATCH", pathItem.patch);
  }
  if (pathItem.trace) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "TRACE", pathItem.trace);
  }
  if (pathItem.parameters) {
    Parameters.generateNamespaceWithList(entryPoint, currentPoint, store, factory, pathItem.parameters);
  }
};
