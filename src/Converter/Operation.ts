import { EOL } from "os";
import * as ts from "typescript";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import * as Guard from "./Guard";
import * as Parameter from "./Parameter";
import * as RequestBody from "./RequestBody";
import * as Responses from "./Responses";
import * as ExternalDocumentation from "./ExternalDocumentation";
import * as Servers from "./Servers";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  operation: OpenApi.Operation,
): ts.ModuleDeclaration => {
  const generateComment = (): string => {
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

  const statements: ts.Statement[] = [];

  if (operation.parameters) {
    const interfaces = operation.parameters.map(parameter => {
      if (Guard.isReference(parameter)) {
        throw new Error("これから対応します");
      }
      return Parameter.generateInterface(entryPoint, currentPoint, factory, parameter.name, parameter);
    });
    statements.push(
      factory.Namespace({
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
    statements.push(RequestBody.generateNamespace(entryPoint, currentPoint, factory, "RequestBody", operation.requestBody));
  }

  if (operation.responses) {
    if (Guard.isReference(operation.responses)) {
      throw new Error("これから対応します");
    }
    statements.push(Responses.generateNamespaceWithStatusCode(entryPoint, currentPoint, factory, operation.responses));
  }

  return factory.Namespace({
    export: true,
    name,
    comment: ExternalDocumentation.addComment(Servers.addComment(generateComment(), operation.servers), operation.externalDocs),
    deprecated: operation.deprecated,
    statements,
  });
};
