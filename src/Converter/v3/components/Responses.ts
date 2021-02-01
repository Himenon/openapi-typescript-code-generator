import * as path from "path";

import ts from "typescript";

import { Factory } from "../../../CodeGenerator";
import { UndefinedComponent } from "../../../Exception";
import * as ConverterContext from "../ConverterContext";
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
  responses: Record<string, OpenApi.Response | OpenApi.Reference>,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): void => {
  const basePath = "components/responses";
  store.addComponent("responses", {
    kind: "namespace",
    name: Name.Components.Responses,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#responsesObject`,
  });
  Object.entries(responses).forEach(([name, response]) => {
    if (Guard.isReference(response)) {
      const reference = Reference.generate<OpenApi.Response>(entryPoint, currentPoint, response);
      if (reference.type === "local") {
        if (!store.hasStatement(reference.path, ["interface"])) {
          throw new UndefinedComponent(`Reference "${response.$ref}" did not found in ${reference.path} by ${reference.name}`);
        }
      } else if (reference.type === "remote") {
        Response.generateNamespace(
          entryPoint,
          reference.referencePoint,
          store,
          factory,
          path.dirname(reference.path), // referencePoint basename === namespace name
          reference.name,
          reference.data,
          context,
          converterContext,
        );
      }
    } else {
      Response.generateNamespace(entryPoint, currentPoint, store, factory, basePath, name, response, context, converterContext);
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
  converterContext: ConverterContext.Types,
): void => {
  const basePath = `${parentPath}/responses`;
  store.addStatement(basePath, {
    kind: "namespace",
    name: Name.ComponentChild.Response,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#responsesObject`,
  });

  Object.entries(responses).forEach(([statusCode, response]) => {
    const nameWithStatusCode = `Status$${statusCode}`;
    if (Guard.isReference(response)) {
      const reference = Reference.generate<OpenApi.Response>(entryPoint, currentPoint, response);
      if (reference.type === "local") {
        context.setReferenceHandler(currentPoint, reference);
        Response.generateReferenceNamespace(
          entryPoint,
          currentPoint,
          store,
          factory,
          basePath,
          nameWithStatusCode,
          reference,
          context,
          converterContext,
        );
      } else if (reference.componentName) {
        // reference先に定義を作成
        Response.generateNamespace(
          entryPoint,
          reference.referencePoint,
          store,
          factory,
          path.dirname(reference.path), // referencePoint basename === namespace name
          reference.name,
          reference.data,
          context,
          converterContext,
        );
        // referenceのTypeAliasの作成
        Response.generateReferenceNamespace(
          entryPoint,
          currentPoint,
          store,
          factory,
          basePath,
          nameWithStatusCode,
          reference,
          context,
          converterContext,
        );
      }
    } else {
      Response.generateNamespace(entryPoint, currentPoint, store, factory, basePath, nameWithStatusCode, response, context, converterContext);
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
  converterContext: ConverterContext.Types,
): ts.Statement[] => {
  const statements: ts.Statement[] = [];
  Object.entries(responses).forEach(([statusCode, response]) => {
    if (!response) {
      return;
    }
    if (Guard.isReference(response)) {
      const reference = Reference.generate<OpenApi.Response>(entryPoint, currentPoint, response);
      if (reference.type === "local") {
        context.setReferenceHandler(currentPoint, reference);
        const { maybeResolvedName, unresolvedPaths } = context.resolveReferencePath(currentPoint, `${reference.path}/Content`);
        if (unresolvedPaths.length === 0) {
          statements.push(
            factory.TypeAliasDeclaration.create({
              export: true,
              name: converterContext.generateResponseName(operationId, statusCode),
              type: factory.TypeReferenceNode.create({
                name: maybeResolvedName,
              }),
            }),
          );
        }
      } else if (reference.componentName) {
        // reference先に定義を作成
        Response.generateNamespace(
          entryPoint,
          reference.referencePoint,
          store,
          factory,
          path.dirname(reference.path), // referencePoint basename === namespace name
          reference.name,
          reference.data,
          context,
          converterContext,
        );
        // referenceのTypeAliasの作成
        const content = reference.data.content;
        if (content) {
          statements.push(
            MediaType.generateInterface(
              entryPoint,
              reference.referencePoint,
              factory,
              converterContext.generateResponseName(operationId, statusCode),
              content,
              context,
              converterContext,
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
            converterContext.generateResponseName(operationId, statusCode),
            response.content,
            context,
            converterContext,
          ),
        );
      }
    }
  });

  return statements;
};
