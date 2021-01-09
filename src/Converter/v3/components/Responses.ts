import * as path from "path";

import ts from "typescript";

import { UndefinedComponent } from "../../../Exception";
import { Factory } from "../../../TypeScriptCodeGenerator";
import * as Guard from "../Guard";
import * as Name from "../Name";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";
import * as MediaType from "./MediaType";
import * as Reference from "./Reference";
import * as Response from "./Response";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  responses: OpenApi.MapLike<string, OpenApi.Response | OpenApi.Reference>,
  context: ToTypeNode.Context,
): void => {
  const basePath = "components/responses";
  store.addComponent("responses", {
    type: "namespace",
    name: Name.Components.Responses,
    value: factory.Namespace.create({
      export: true,
      name: Name.Components.Responses,
      statements: [],
      comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#responsesObject`,
    }),
    statements: {},
  });
  Object.entries(responses).forEach(([name, response]) => {
    if (Guard.isReference(response)) {
      const reference = Reference.generate<OpenApi.Response>(entryPoint, currentPoint, response);
      if (reference.type === "local") {
        if (!store.hasStatement(reference.path, ["interface"])) {
          throw new UndefinedComponent(`Reference "${response.$ref}" did not found in ${reference.path} by ${reference.name}`);
        }
      } else if (reference.type === "remote") {
        Response.generateNamespace(entryPoint, reference.referencePoint, store, factory, basePath, reference.name, reference.data, context);
      }
    } else {
      Response.generateNamespace(entryPoint, currentPoint, store, factory, basePath, name, response, context);
    }
  });
};

export const generateNamespaceWithStatusCode = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  parentPath: string,
  responses: OpenApi.Responses,
  context: ToTypeNode.Context,
): void => {
  const basePath = `${parentPath}/responses`;
  store.addStatement(basePath, {
    type: "namespace",
    name: Name.ComponentChild.Response,
    value: factory.Namespace.create({
      export: true,
      name: Name.ComponentChild.Response,
      statements: [],
      comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#responsesObject`,
    }),
    statements: {},
  });

  Object.entries(responses).forEach(([statusCode, response]) => {
    const nameWithStatusCode = `Status$${statusCode}`;
    if (Guard.isReference(response)) {
      const reference = Reference.generate<OpenApi.Response>(entryPoint, currentPoint, response);
      if (reference.type === "local") {
        context.setReferenceHandler(reference);
        Response.generateReferenceNamespace(entryPoint, currentPoint, store, factory, basePath, nameWithStatusCode, reference, context);
      } else if (reference.componentName) {
        // reference先に定義を作成
        Response.generateNamespace(
          entryPoint,
          reference.referencePoint,
          store,
          factory,
          path.dirname(reference.path), // TODO write reason
          reference.name,
          reference.data,
          context,
        );
        // referenceのTypeAliasの作成
        Response.generateReferenceNamespace(entryPoint, currentPoint, store, factory, basePath, nameWithStatusCode, reference, context);
      }
    } else {
      Response.generateNamespace(entryPoint, currentPoint, store, factory, basePath, nameWithStatusCode, response, context);
    }
  });
};

export const generateInterfacesWithStatusCode = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  operationId: string,
  responses: OpenApi.Responses,
  context: ToTypeNode.Context,
): ts.Statement[] => {
  const statements: ts.Statement[] = [];
  Object.entries(responses).forEach(([statusCode, response]) => {
    const nameWithStatusCode = `Status$${statusCode}`;
    if (!response) {
      return;
    }
    if (Guard.isReference(response)) {
      const reference = Reference.generate<OpenApi.Response>(entryPoint, currentPoint, response);
      if (reference.type === "local") {
        context.setReferenceHandler(reference);
        statements.push(
          factory.TypeAliasDeclaration.create({
            export: true,
            name: Name.responseName(operationId, statusCode),
            type: factory.TypeReferenceNode.create({
              name: context.getReferenceName(currentPoint, `${reference.path}/Content`, "local"),
            }),
          }),
        );
      } else if (reference.componentName) {
        // reference先に定義を作成
        Response.generateNamespace(
          entryPoint,
          reference.referencePoint,
          store,
          factory,
          path.dirname(reference.path), // TODO write reason
          reference.name,
          reference.data,
          context,
        );
        // referenceのTypeAliasの作成
        const content = reference.data.content;
        if (content) {
          statements.push(
            MediaType.generateInterface(
              entryPoint,
              currentPoint,
              factory,
              Name.responseName(operationId, nameWithStatusCode),
              content,
              context,
            ),
          );
        }
      }
    } else {
      if (response.content) {
        statements.push(
          MediaType.generateInterface(
            entryPoint,
            currentPoint,
            factory,
            `Response$${operationId}$${nameWithStatusCode}`,
            response.content,
            context,
          ),
        );
      }
    }
  });

  return statements;
};
