import { EOL } from "os";
import * as path from "path";

import ts from "typescript";

import { Factory } from "../../../CodeGenerator";
import * as Guard from "../Guard";
import * as Name from "../Name";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";
import * as ExternalDocumentation from "./ExternalDocumentation";
import * as Parameter from "./Parameter";
import * as Reference from "./Reference";
import * as RequestBody from "./RequestBody";
import * as Responses from "./Responses";
import * as Servers from "./Servers";

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

// 使わない可能性あり
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
  const operationId = operation.operationId;
  if (!operationId) {
    throw new Error("not setting operationId\n" + JSON.stringify(operation));
  }
  store.addStatement(basePath, {
    type: "namespace",
    name,
    value: factory.Namespace.create({
      export: true,
      name,
      comment: ExternalDocumentation.addComment(Servers.addComment([generateComment(operation)], operation.servers), operation.externalDocs),
      deprecated: operation.deprecated,
      statements: [],
    }),
    statements: {},
  });

  if (operation.parameters) {
    const parameterName = "Parameter";
    store.addStatement(`${basePath}/Parameter`, {
      type: "interface",
      name: parameterName,
      value: Parameter.generateInterface(entryPoint, currentPoint, factory, parameterName, operation.parameters, context),
    });
  }

  if (operation.requestBody) {
    if (Guard.isReference(operation.requestBody)) {
      const reference = Reference.generate<OpenApi.RequestBody>(entryPoint, currentPoint, operation.requestBody);
      if (reference.type === "local") {
        context.setReferenceHandler(reference);
        // TODO (not-use) 追加する必要がある（このメソッドを使わない可能性あり）
        factory.TypeReferenceNode.create({ name: context.getReferenceName(currentPoint, reference.path) });
      } else if (reference.type === "remote" && reference.componentName) {
        const contentPath = path.join(reference.path, "Content"); // requestBodyはNamespaceを形成するため
        const name = "Content";
        store.addStatement(contentPath, {
          type: "interface",
          name: name,
          value: RequestBody.generateInterface(entryPoint, reference.referencePoint, factory, name, reference.data, context),
        });
        const typeAliasName = context.getReferenceName(currentPoint, contentPath);
        store.addStatement(`${basePath}/RequestBody`, {
          type: "typeAlias",
          name: typeAliasName,
          value: factory.TypeAliasDeclaration.create({
            export: true,
            name: "RequestBody",
            type: factory.TypeReferenceNode.create({ name: typeAliasName }),
          }),
        });
      }
    } else {
      RequestBody.generateNamespace(entryPoint, currentPoint, store, factory, basePath, "RequestBody", operation.requestBody, context);
    }
  }

  if (operation.responses) {
    Responses.generateNamespaceWithStatusCode(entryPoint, currentPoint, store, factory, basePath, operation.responses, context);
  }
};

export const generateStatements = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  requestUri: string,
  httpMethod: string, // PUT POST PATCH
  operation: OpenApi.Operation,
  context: ToTypeNode.Context,
): ts.Statement[] => {
  let statements: ts.Statement[] = [];
  const operationId = operation.operationId;
  if (!operationId) {
    throw new Error("not setting operationId\n" + JSON.stringify(operation));
  }
  store.updateOperationState(httpMethod, requestUri, operationId, {});
  if (operation.parameters) {
    const parameterName = Name.parameterName(operationId);
    statements.push(Parameter.generateAliasInterface(entryPoint, currentPoint, factory, parameterName, operation.parameters, context));
  }
  if (operation.requestBody) {
    const requestBodyName = Name.requestBodyName(operationId);
    if (Guard.isReference(operation.requestBody)) {
      const reference = Reference.generate<OpenApi.RequestBody>(entryPoint, currentPoint, operation.requestBody);
      if (reference.type === "local") {
        context.setReferenceHandler(reference);
        statements.push(
          factory.TypeAliasDeclaration.create({
            export: true,
            name: Name.requestBodyName(operationId),
            type: factory.TypeReferenceNode.create({
              name: context.getReferenceName(currentPoint, `${reference.path}`) + "." + Name.ComponentChild.Content, // TODO Contextから作成？
            }),
          }),
        );
      } else if (reference.type === "remote" && reference.componentName) {
        const contentPath = path.join(reference.path, "Content"); // requestBodyはNamespaceを形成するため
        const name = "Content";
        store.addStatement(contentPath, {
          type: "interface",
          name: name,
          value: RequestBody.generateInterface(entryPoint, reference.referencePoint, factory, name, reference.data, context),
        });
        statements.push(
          factory.TypeAliasDeclaration.create({
            export: true,
            name: requestBodyName,
            type: factory.TypeReferenceNode.create({ name: context.getReferenceName(currentPoint, contentPath) }),
          }),
        );

        store.updateOperationState(httpMethod, requestUri, operationId, {
          requestBodyName: requestBodyName,
        });
      }
    } else {
      statements.push(RequestBody.generateInterface(entryPoint, currentPoint, factory, requestBodyName, operation.requestBody, context));
      store.updateOperationState(httpMethod, requestUri, operationId, {
        requestBodyName: requestBodyName,
      });
    }
  }

  if (operation.responses) {
    statements = statements.concat(
      Responses.generateInterfacesWithStatusCode(entryPoint, currentPoint, store, factory, operationId, operation.responses, context).flat(),
    );
  }

  return statements;
};
