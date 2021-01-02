import { OpenApi } from "./types";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as Guard from "./Guard";
import * as Response from "./Response";
import * as Reference from "./Reference";
import { Store } from "./store";
import { UndefinedComponent, FeatureDevelopmentError } from "../../Exception";
import * as ToTypeNode from "./toTypeNode";

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
        Response.generateNamespace(entryPoint, currentPoint, store, factory, basePath, reference.name, reference.data, context);
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
    if (Guard.isReference(response)) {
      throw new FeatureDevelopmentError("これから");
    }
    Response.generateNamespace(entryPoint, currentPoint, store, factory, basePath, `Status$${statusCode}`, response, context);
  });
};
