import { EOL } from "os";
import ts from "typescript";
import { OpenApi } from "./types";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as Guard from "./Guard";
import * as Parameter from "./Parameter";
import * as RequestBody from "./RequestBody";
import * as Responses from "./Responses";
import * as ExternalDocumentation from "./ExternalDocumentation";
import * as Servers from "./Servers";
import { Store } from "./store";
import * as ToTypeNode from "./toTypeNode";

const generateComment = (operation: OpenApi.Operation): string => {
  const comments: string[] = [];
  if (operation.summary) {
    comments.push(operation.summary);
  }
  if (operation.description) {
    comments.push(operation.description);
  }
  if (operation.tags) {
    comments.push(`tags: ${operation.tags.join(", ")}`);
  }
  return comments.join(EOL);
};

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  parentPath: string,
  name: string,
  operation: OpenApi.Operation,
  context: ToTypeNode.Context,
): void => {
  store.addStatement(`${parentPath}/${name}`, {
    type: "namespace",
    value: factory.Namespace.create({
      export: true,
      name,
      comment: ExternalDocumentation.addComment(Servers.addComment(generateComment(operation), operation.servers), operation.externalDocs),
      deprecated: operation.deprecated,
      statements: [],
    }),
    statements: {},
  });

  const statements: ts.Statement[] = [];

  if (operation.parameters) {
    const interfaces = operation.parameters.map(parameter => {
      if (Guard.isReference(parameter)) {
        throw new Error("これから対応します");
      }
      return Parameter.generateInterface(entryPoint, currentPoint, factory, parameter.name, parameter, context);
    });
    statements.push(
      factory.Namespace.create({
        name: "Parameters",
        export: true,
        statements: interfaces,
      }),
    );
  }

  if (operation.requestBody) {
    if (Guard.isReference(operation.requestBody)) {
      throw new Error("これから対応します");
    }
    statements.push(RequestBody.generateNamespace(entryPoint, currentPoint, factory, "RequestBody", operation.requestBody, context));
  }

  if (operation.responses) {
    if (Guard.isReference(operation.responses)) {
      throw new Error("これから対応します");
    }
    Responses.generateNamespaceWithStatusCode(entryPoint, currentPoint, store, factory, operation.responses, context);
  }
};
