import { OpenApi } from "./types";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as Guard from "./Guard";
import * as Response from "./Response";
import * as Reference from "./Reference";
import { Store } from "./store";
import { UndefinedComponent } from "../../Exception";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  responses: OpenApi.MapLike<string, OpenApi.Response | OpenApi.Reference>,
): void => {
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
        if (!store.hasStatement(reference.path, "interface")) {
          throw new UndefinedComponent(`Reference "${response.$ref}" did not found in ${reference.path} by ${reference.name}`);
        }
      } else if (reference.type === "remote") {
        Response.generateNamespace(entryPoint, currentPoint, store, factory, reference.name, reference.data);
      }
    } else {
      Response.generateNamespace(entryPoint, currentPoint, store, factory, name, response);
    }
  });
};

export const generateNamespaceWithStatusCode = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  responses: OpenApi.Responses,
): void => {
  store.addStatement("components/responses", {
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
      return factory.Interface({
        name: `TODO:${response.$ref}`,
        members: [],
      });
    }
    Response.generateNamespace(entryPoint, currentPoint, store, factory, `Status$${statusCode}`, response);
  });
};
