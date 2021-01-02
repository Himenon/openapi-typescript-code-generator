import { EOL } from "os";
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
import { FeatureDevelopmentError } from "../../Exception";

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
  const basePath = `${parentPath}/${name}`;
  console.log(`\n ---- Start: ${basePath} ---- \n`);
  store.addStatement(basePath, {
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

  if (operation.parameters) {
    operation.parameters.forEach(parameter => {
      if (Guard.isReference(parameter)) {
        throw new FeatureDevelopmentError("Local reference対応");
      }
      store.addStatement(`${parentPath}/${name}/Parameters/${parameter.name}`, {
        type: "interface",
        value: Parameter.generateInterface(entryPoint, currentPoint, factory, parameter.name, parameter, context),
      });
    });
  }

  if (operation.requestBody) {
    if (Guard.isReference(operation.requestBody)) {
      throw new FeatureDevelopmentError("Local reference対応");
    }
    RequestBody.generateNamespace(entryPoint, currentPoint, store, factory, "RequestBody", operation.requestBody, context);
  }

  if (operation.responses) {
    if (Guard.isReference(operation.responses)) {
      throw new FeatureDevelopmentError("Local reference対応");
    }
    Responses.generateNamespaceWithStatusCode(entryPoint, currentPoint, store, factory, basePath, operation.responses, context);
  }

  console.log(`\n ---- Finish: ${basePath} ---- \n`);
};
