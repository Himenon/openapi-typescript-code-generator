import ts from "typescript";
import { OpenApi } from "./types";
import * as Parameters from "./Parameters";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as Operation from "./Operation";
import * as Servers from "./Servers";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  pathItem: OpenApi.PathItem,
): ts.ModuleDeclaration => {
  const statements: ts.Statement[] = [];
  if (pathItem.get) {
    statements.push(Operation.generateNamespace(entryPoint, currentPoint, factory, "GET", pathItem.get));
  }
  if (pathItem.put) {
    statements.push(Operation.generateNamespace(entryPoint, currentPoint, factory, "PUT", pathItem.put));
  }
  if (pathItem.post) {
    statements.push(Operation.generateNamespace(entryPoint, currentPoint, factory, "POST", pathItem.post));
  }
  if (pathItem.delete) {
    statements.push(Operation.generateNamespace(entryPoint, currentPoint, factory, "DELETE", pathItem.delete));
  }
  if (pathItem.options) {
    statements.push(Operation.generateNamespace(entryPoint, currentPoint, factory, "OPTIONS", pathItem.options));
  }
  if (pathItem.head) {
    statements.push(Operation.generateNamespace(entryPoint, currentPoint, factory, "HEAD", pathItem.head));
  }
  if (pathItem.patch) {
    statements.push(Operation.generateNamespace(entryPoint, currentPoint, factory, "PATCH", pathItem.patch));
  }
  if (pathItem.trace) {
    statements.push(Operation.generateNamespace(entryPoint, currentPoint, factory, "TRACE", pathItem.trace));
  }
  if (pathItem.parameters) {
    statements.push(Parameters.generateNamespaceWithList(entryPoint, currentPoint, factory, pathItem.parameters));
  }
  return factory.Namespace({
    export: true,
    name,
    statements,
    comment: Servers.addComment(pathItem.description, pathItem.servers),
  });
};
