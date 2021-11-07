import { EOL } from "os";
import * as path from "path";

import ts from "typescript";

import type { OpenApi } from "../../../types";
import { Factory } from "../../TsGenerator";
import * as ConverterContext from "../ConverterContext";
import * as Guard from "../Guard";
import * as Name from "../Name";
import * as ToTypeNode from "../toTypeNode";
import type * as Walker from "../Walker";
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
  store: Walker.Store,
  factory: Factory.Type,
  parentPath: string,
  name: string,
  operation: OpenApi.Operation,
  pathItemParameters: OpenApi.PathItem["parameters"],
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): void => {
  const basePath = `${parentPath}/${name}`;
  const operationId = operation.operationId;
  if (!operationId) {
    throw new Error("not setting operationId\n" + JSON.stringify(operation));
  }
  store.addStatement(basePath, {
    kind: "namespace",
    name,
    comment: ExternalDocumentation.addComment(Servers.addComment([generateComment(operation)], operation.servers), operation.externalDocs),
    deprecated: operation.deprecated,
  });

  const parameters = [...(pathItemParameters || []), ...(operation.parameters || [])];

  if (parameters.length > 0) {
    const parameterName = "Parameter";
    store.addStatement(`${basePath}/Parameter`, {
      kind: "interface",
      name: parameterName,
      value: Parameter.generateInterface(entryPoint, currentPoint, store, factory, parameterName, parameters, context, converterContext),
    });
  }

  if (operation.requestBody) {
    if (Guard.isReference(operation.requestBody)) {
      const reference = Reference.generate<OpenApi.RequestBody>(entryPoint, currentPoint, operation.requestBody);
      if (reference.type === "local") {
        context.setReferenceHandler(currentPoint, reference);
        // TODO (not-use) 追加する必要がある（このメソッドを使わない可能性あり）
        factory.TypeReferenceNode.create({ name: context.resolveReferencePath(currentPoint, reference.path).name });
      } else if (reference.type === "remote" && reference.componentName) {
        const contentPath = path.join(reference.path, "Content"); // requestBodyはNamespaceを形成するため
        const name = "Content";
        store.addStatement(contentPath, {
          kind: "interface",
          name: name,
          value: RequestBody.generateInterface(entryPoint, reference.referencePoint, factory, name, reference.data, context, converterContext),
        });
        const typeAliasName = context.resolveReferencePath(currentPoint, contentPath).name;
        store.addStatement(`${basePath}/RequestBody`, {
          kind: "typeAlias",
          name: typeAliasName,
          value: factory.TypeAliasDeclaration.create({
            export: true,
            name: "RequestBody",
            type: factory.TypeReferenceNode.create({ name: typeAliasName }),
          }),
        });
      }
    } else {
      RequestBody.generateNamespace(
        entryPoint,
        currentPoint,
        store,
        factory,
        basePath,
        "RequestBody",
        operation.requestBody,
        context,
        converterContext,
      );
    }
  }

  if (operation.responses) {
    Responses.generateNamespaceWithStatusCode(
      entryPoint,
      currentPoint,
      store,
      factory,
      basePath,
      operation.responses,
      context,
      converterContext,
    );
  }
};

export const generateStatements = (
  entryPoint: string,
  currentPoint: string,
  store: Walker.Store,
  factory: Factory.Type,
  requestUri: string,
  httpMethod: string, // PUT POST PATCH
  operation: OpenApi.Operation,
  pathItemParameters: OpenApi.PathItem["parameters"],
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): ts.Statement[] => {
  let statements: ts.Statement[] = [];
  const operationId = operation.operationId;
  if (!operationId) {
    throw new Error("not setting operationId\n" + JSON.stringify(operation));
  }
  store.updateOperationState(httpMethod, requestUri, operationId, {});
  const parameters = [...(pathItemParameters || []), ...(operation.parameters || [])];
  if (parameters.length > 0) {
    const parameterName = converterContext.generateParameterName(operationId);
    statements.push(
      Parameter.generateAliasInterface(entryPoint, currentPoint, store, factory, parameterName, parameters, context, converterContext),
    );
  }
  if (operation.requestBody) {
    const requestBodyName = converterContext.generateRequestBodyName(operationId);
    if (Guard.isReference(operation.requestBody)) {
      const reference = Reference.generate<OpenApi.RequestBody>(entryPoint, currentPoint, operation.requestBody);
      if (reference.type === "local") {
        context.setReferenceHandler(currentPoint, reference);
        statements.push(
          factory.TypeAliasDeclaration.create({
            export: true,
            name: converterContext.generateRequestBodyName(operationId),
            type: factory.TypeReferenceNode.create({
              name: context.resolveReferencePath(currentPoint, `${reference.path}`).name + "." + Name.ComponentChild.Content, // TODO Contextから作成？
            }),
          }),
        );
      } else if (reference.type === "remote" && reference.componentName) {
        const contentPath = path.join(reference.path, "Content"); // requestBodyはNamespaceを形成するため
        const name = "Content";
        store.addStatement(contentPath, {
          kind: "interface",
          name: name,
          value: RequestBody.generateInterface(entryPoint, reference.referencePoint, factory, name, reference.data, context, converterContext),
        });
        statements.push(
          factory.TypeAliasDeclaration.create({
            export: true,
            name: converterContext.escapeDeclarationText(requestBodyName),
            type: factory.TypeReferenceNode.create({ name: context.resolveReferencePath(currentPoint, contentPath).name }),
          }),
        );

        store.updateOperationState(httpMethod, requestUri, operationId, {
          requestBodyName: requestBodyName,
        });
      }
    } else {
      statements.push(
        RequestBody.generateInterface(entryPoint, currentPoint, factory, requestBodyName, operation.requestBody, context, converterContext),
      );
      store.updateOperationState(httpMethod, requestUri, operationId, {
        requestBodyName: requestBodyName,
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
        operationId,
        operation.responses,
        context,
        converterContext,
      ).flat(),
    );
  }

  return statements;
};
