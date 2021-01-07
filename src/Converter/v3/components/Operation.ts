import { EOL } from "os";
import * as path from "path";

import ts from "typescript";

import { Factory } from "../../../TypeScriptCodeGenerator";
import * as Guard from "../Guard";
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
    store.addStatement(`${basePath}/Parameter`, {
      type: "interface",
      value: Parameter.generateInterface(entryPoint, currentPoint, factory, "Parameter", operation.parameters, context),
    });
  }

  if (operation.requestBody) {
    if (Guard.isReference(operation.requestBody)) {
      const reference = Reference.generate<OpenApi.RequestBody>(entryPoint, currentPoint, operation.requestBody);
      if (reference.type === "local") {
        context.setReferenceHandler(reference);
        // TODO 追加する必要がある
        factory.TypeReferenceNode.create({ name: context.getReferenceName(currentPoint, reference.path, "local") });
      } else if (reference.type === "remote" && reference.componentName) {
        const contentPath = path.join(reference.path, "Content"); // requestBodyはNamespaceを形成するため
        store.addStatement(contentPath, {
          type: "interface",
          value: RequestBody.generateInterface(entryPoint, reference.referencePoint, factory, "Content", reference.data, context),
        });
        store.addStatement(`${basePath}/RequestBody`, {
          type: "typeAlias",
          value: factory.TypeAliasDeclaration.create({
            export: true,
            name: "RequestBody",
            type: factory.TypeReferenceNode.create({ name: context.getReferenceName(currentPoint, contentPath, "remote") }),
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

const getSuccessResponseContentTypeList = (responses: OpenApi.Responses): string[] => {
  return Object.keys(responses);
};

const getRequestContentTypeList = (requestBody: OpenApi.RequestBody): string[] => {
  return Object.keys(requestBody.content);
};

export const generateStatements = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  requestUri: string,
  parentPath: string,
  httpMethod: string, // PUT POST PATCH
  operation: OpenApi.Operation,
  context: ToTypeNode.Context,
): ts.Statement[] => {
  let statements: ts.Statement[] = [];
  const basePath = `${parentPath}/${httpMethod}`;
  const operationId = operation.operationId;
  if (!operationId) {
    throw new Error("not setting operationId\n" + JSON.stringify(operation));
  }
  store.updateOperationState(httpMethod, requestUri, operationId, {});
  if (operation.parameters) {
    const parameterName = `Parameter$${operationId}`;
    statements.push(Parameter.generateInterface(entryPoint, currentPoint, factory, parameterName, operation.parameters, context));
    store.updateOperationState(httpMethod, requestUri, operationId, {
      parameterName: parameterName,
      parameters: operation.parameters
        .map(parameter => Parameter.getSchema(entryPoint, currentPoint, parameter))
        .filter(Boolean) as OpenApi.Parameter[],
    });
  }
  if (operation.requestBody) {
    const requestBodyName = `RequestBody$${operationId}`;
    if (Guard.isReference(operation.requestBody)) {
      const reference = Reference.generate<OpenApi.RequestBody>(entryPoint, currentPoint, operation.requestBody);
      if (reference.type === "local") {
        context.setReferenceHandler(reference);
        // TODO 追加する必要がある
        factory.TypeReferenceNode.create({ name: context.getReferenceName(currentPoint, reference.path, "local") });
      } else if (reference.type === "remote" && reference.componentName) {
        const contentPath = path.join(reference.path, "Content"); // requestBodyはNamespaceを形成するため
        store.addStatement(contentPath, {
          type: "interface",
          value: RequestBody.generateInterface(entryPoint, reference.referencePoint, factory, "Content", reference.data, context),
        });
        statements.push(
          factory.TypeAliasDeclaration.create({
            export: true,
            name: requestBodyName,
            type: factory.TypeReferenceNode.create({ name: context.getReferenceName(currentPoint, contentPath, "remote") }),
          }),
        );

        store.updateOperationState(httpMethod, requestUri, operationId, {
          requestBodyName: requestBodyName,
          requestContentTypeList: getRequestContentTypeList(reference.data),
        });
      }
    } else {
      statements.push(RequestBody.generateInterface(entryPoint, currentPoint, factory, requestBodyName, operation.requestBody, context));
      store.updateOperationState(httpMethod, requestUri, operationId, {
        requestBodyName: requestBodyName,
        requestContentTypeList: getRequestContentTypeList(operation.requestBody),
      });
    }
  }

  if (operation.responses) {
    statements = statements.concat(
      Responses.generateInterfacesWithStatusCode(
        entryPoint,
        currentPoint,
        store,
        factory,
        basePath,
        operationId,
        operation.responses,
        context,
      ).flat(),
    );
    store.updateOperationState(httpMethod, requestUri, operationId, {
      successResponseContentTypeList: getSuccessResponseContentTypeList(operation.responses),
    });
  }

  return statements;
};
