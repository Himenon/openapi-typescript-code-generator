import ts from "typescript";

import { Factory } from "../../../CodeGenerator";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";
import * as Operation from "./Operation";
import * as Parameters from "./Parameters";
import * as Servers from "./Servers";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  parentPath: string,
  name: string,
  pathItem: OpenApi.PathItem,
  context: ToTypeNode.Context,
  options?: { topComment?: string },
): void => {
  const basePath = `${parentPath}/${name}`;
  const topComment = options && options.topComment && options.topComment;
  store.addStatement(basePath, {
    type: "namespace",
    name,
    value: factory.Namespace.create({
      export: true,
      name,
      statements: [],
      comment: Servers.addComment([topComment, pathItem.description], pathItem.servers),
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

export const generateStatements = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  requestUri: string,
  pathItem: OpenApi.PathItem,
  context: ToTypeNode.Context,
): ts.Statement[] => {
  const statements: ts.Statement[][] = [];
  if (pathItem.get) {
    statements.push(Operation.generateStatements(entryPoint, currentPoint, store, factory, requestUri, "GET", pathItem.get, context));
  }
  if (pathItem.put) {
    statements.push(Operation.generateStatements(entryPoint, currentPoint, store, factory, requestUri, "PUT", pathItem.put, context));
  }
  if (pathItem.post) {
    statements.push(Operation.generateStatements(entryPoint, currentPoint, store, factory, requestUri, "POST", pathItem.post, context));
  }
  if (pathItem.delete) {
    statements.push(Operation.generateStatements(entryPoint, currentPoint, store, factory, requestUri, "DELETE", pathItem.delete, context));
  }
  if (pathItem.options) {
    statements.push(Operation.generateStatements(entryPoint, currentPoint, store, factory, requestUri, "OPTIONS", pathItem.options, context));
  }
  if (pathItem.head) {
    statements.push(Operation.generateStatements(entryPoint, currentPoint, store, factory, requestUri, "HEAD", pathItem.head, context));
  }
  if (pathItem.patch) {
    statements.push(Operation.generateStatements(entryPoint, currentPoint, store, factory, requestUri, "PATCH", pathItem.patch, context));
  }
  if (pathItem.trace) {
    statements.push(Operation.generateStatements(entryPoint, currentPoint, store, factory, requestUri, "TRACE", pathItem.trace, context));
  }
  // if (pathItem.parameters) {
  //   Parameters.generateNamespaceWithList(entryPoint, currentPoint, store, factory, pathItem.parameters, context);
  // }

  return statements.flat();
};
