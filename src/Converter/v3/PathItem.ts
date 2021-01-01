import { OpenApi } from "./types";
import * as Parameters from "./Parameters";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as Operation from "./Operation";
import * as Servers from "./Servers";
import { Store } from "./store";
import * as ToTypeNode from "./toTypeNode";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  parentPath: string,
  name: string,
  pathItem: OpenApi.PathItem,
  setReference: ToTypeNode.SetReferenceCallback,
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
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "GET", pathItem.get, setReference);
  }
  if (pathItem.put) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "PUT", pathItem.put, setReference);
  }
  if (pathItem.post) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "POST", pathItem.post, setReference);
  }
  if (pathItem.delete) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "DELETE", pathItem.delete, setReference);
  }
  if (pathItem.options) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "OPTIONS", pathItem.options, setReference);
  }
  if (pathItem.head) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "HEAD", pathItem.head, setReference);
  }
  if (pathItem.patch) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "PATCH", pathItem.patch, setReference);
  }
  if (pathItem.trace) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "TRACE", pathItem.trace, setReference);
  }
  if (pathItem.parameters) {
    Parameters.generateNamespaceWithList(entryPoint, currentPoint, store, factory, pathItem.parameters, setReference);
  }
};
