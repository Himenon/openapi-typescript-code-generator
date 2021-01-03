import { EOL } from "os";
import * as path from "path";

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
        const reference = Reference.generate<OpenApi.Parameter>(entryPoint, currentPoint, parameter);
        if (reference.type === "local") {
          context.setReferenceHandler(reference);
          return factory.TypeReferenceNode.create({ name: context.getReferenceName(currentPoint, reference.path, "local") });
        } else if (reference.componentName) {
          store.addStatement(reference.path, {
            type: "interface",
            value: Parameter.generateInterface(entryPoint, reference.referencePoint, factory, reference.name, reference.data, context),
          });
          store.addStatement(`${basePath}/Parameter/${reference.data.name}`, {
            type: "typeAlias",
            value: factory.TypeAliasDeclaration.create({
              export: true,
              name: reference.data.name,
              type: factory.TypeReferenceNode.create({ name: context.getReferenceName(currentPoint, reference.path, "remote") }),
            }),
          });
        } else {
          store.addStatement(`${basePath}/Parameter/${reference.data.name}`, {
            type: "interface",
            value: Parameter.generateInterface(entryPoint, currentPoint, factory, reference.data.name, reference.data, context),
          });
        }
      } else {
        store.addStatement(`${basePath}/Parameter/${parameter.name}`, {
          type: "interface",
          value: Parameter.generateInterface(entryPoint, currentPoint, factory, parameter.name, parameter, context),
        });
      }
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

  console.log(`\n ---- Finish: ${basePath} ---- \n`);
};
