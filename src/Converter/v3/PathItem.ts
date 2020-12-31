import ts from "typescript";
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
  name: string,
  pathItem: OpenApi.PathItem,
): ts.ModuleDeclaration => {
  const statements: ts.Statement[] = [];
  if (pathItem.get) {
    statements.push(Operation.generateNamespace(entryPoint, currentPoint, store, factory, "GET", pathItem.get));
  }
  if (pathItem.put) {
    statements.push(Operation.generateNamespace(entryPoint, currentPoint, store, factory, "PUT", pathItem.put));
  }
  if (pathItem.post) {
    statements.push(Operation.generateNamespace(entryPoint, currentPoint, store, factory, "POST", pathItem.post));
  }
  if (pathItem.delete) {
    statements.push(Operation.generateNamespace(entryPoint, currentPoint, store, factory, "DELETE", pathItem.delete));
  }
  if (pathItem.options) {
    statements.push(Operation.generateNamespace(entryPoint, currentPoint, store, factory, "OPTIONS", pathItem.options));
  }
  if (pathItem.head) {
    statements.push(Operation.generateNamespace(entryPoint, currentPoint, store, factory, "HEAD", pathItem.head));
  }
  if (pathItem.patch) {
    statements.push(Operation.generateNamespace(entryPoint, currentPoint, store, factory, "PATCH", pathItem.patch));
  }
  if (pathItem.trace) {
    statements.push(Operation.generateNamespace(entryPoint, currentPoint, store, factory, "TRACE", pathItem.trace));
  }
  if (pathItem.parameters) {
    statements.push(Parameters.generateNamespaceWithList(entryPoint, currentPoint, factory, pathItem.parameters));
  }
  return factory.Namespace.create({
    export: true,
    name,
    statements,
    comment: Servers.addComment(pathItem.description, pathItem.servers),
  });
};
