import { UndefinedComponent } from "../../Exception";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as Guard from "./Guard";
import * as Reference from "./Reference";
import * as Response from "./Response";
import { Store } from "./store";
import * as ToTypeNode from "./toTypeNode";
import { OpenApi } from "./types";

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
    value: factory.Namespace.create({
      export: true,
      name: "Responses",
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
    value: factory.Namespace.create({
      export: true,
      name: "Responses",
      statements: [],
      comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#responsesObject`,
    }),
    statements: {},
  });

  Object.entries(responses).map(([statusCode, response]) => {
    const name = `Status$${statusCode}`;
    if (Guard.isReference(response)) {
      const reference = Reference.generate<OpenApi.Response>(entryPoint, currentPoint, response);
      if (reference.type === "local") {
        context.setReferenceHandler(reference);
        return factory.TypeReferenceNode.create({ name: context.getReferenceName(currentPoint, reference.path, "local") });
      } else if (reference.componentName) {
        Response.generateNamespace(
          entryPoint,
          reference.referencePoint,
          store,
          factory,
          reference.path,
          reference.name,
          reference.data,
          context,
        );
        return store.addStatement(`${basePath}/${name}`, {
          type: "typeAlias",
          value: factory.TypeAliasDeclaration.create({
            export: true,
            name: name,
            type: factory.TypeReferenceNode.create({ name: context.getReferenceName(currentPoint, reference.path, "remote") }),
          }),
        });
      }
      return;
    }
    Response.generateNamespace(entryPoint, currentPoint, store, factory, basePath, name, response, context);
  });
};
