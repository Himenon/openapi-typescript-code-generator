import ts from "typescript";

import { Factory } from "../../CodeGenerator";
import * as ConverterContext from "../ConverterContext";
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
  converterContext: ConverterContext.Types,
  options?: { topComment?: string },
): void => {
  const basePath = `${parentPath}/${name}`;
  const topComment = options && options.topComment && options.topComment;
  store.addStatement(basePath, {
    kind: "namespace",
    name,
    comment: Servers.addComment([topComment, pathItem.description], pathItem.servers),
  });
  if (pathItem.get) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "GET", pathItem.get, context, converterContext);
  }
  if (pathItem.put) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "PUT", pathItem.put, context, converterContext);
  }
  if (pathItem.post) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "POST", pathItem.post, context, converterContext);
  }
  if (pathItem.delete) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "DELETE", pathItem.delete, context, converterContext);
  }
  if (pathItem.options) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "OPTIONS", pathItem.options, context, converterContext);
  }
  if (pathItem.head) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "HEAD", pathItem.head, context, converterContext);
  }
  if (pathItem.patch) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "PATCH", pathItem.patch, context, converterContext);
  }
  if (pathItem.trace) {
    Operation.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "TRACE", pathItem.trace, context, converterContext);
  }
  if (pathItem.parameters) {
    Parameters.generateNamespaceWithList(entryPoint, currentPoint, store, factory, pathItem.parameters, context, converterContext);
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
  converterContext: ConverterContext.Types,
): ts.Statement[] => {
  const statements: ts.Statement[][] = [];
  if (pathItem.get) {
    statements.push(
      Operation.generateStatements(entryPoint, currentPoint, store, factory, requestUri, "GET", pathItem.get, context, converterContext),
    );
  }
  if (pathItem.put) {
    statements.push(
      Operation.generateStatements(entryPoint, currentPoint, store, factory, requestUri, "PUT", pathItem.put, context, converterContext),
    );
  }
  if (pathItem.post) {
    statements.push(
      Operation.generateStatements(entryPoint, currentPoint, store, factory, requestUri, "POST", pathItem.post, context, converterContext),
    );
  }
  if (pathItem.delete) {
    statements.push(
      Operation.generateStatements(entryPoint, currentPoint, store, factory, requestUri, "DELETE", pathItem.delete, context, converterContext),
    );
  }
  if (pathItem.options) {
    statements.push(
      Operation.generateStatements(
        entryPoint,
        currentPoint,
        store,
        factory,
        requestUri,
        "OPTIONS",
        pathItem.options,
        context,
        converterContext,
      ),
    );
  }
  if (pathItem.head) {
    statements.push(
      Operation.generateStatements(entryPoint, currentPoint, store, factory, requestUri, "HEAD", pathItem.head, context, converterContext),
    );
  }
  if (pathItem.patch) {
    statements.push(
      Operation.generateStatements(entryPoint, currentPoint, store, factory, requestUri, "PATCH", pathItem.patch, context, converterContext),
    );
  }
  if (pathItem.trace) {
    statements.push(
      Operation.generateStatements(entryPoint, currentPoint, store, factory, requestUri, "TRACE", pathItem.trace, context, converterContext),
    );
  }
  // if (pathItem.parameters) {
  //   Parameters.generateNamespaceWithList(entryPoint, currentPoint, store, factory, pathItem.parameters, context);
  // }

  return statements.flat();
};
