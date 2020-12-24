import * as ts from "typescript";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import * as Guard from "./Guard";
import * as Response from "./Response";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  responses: OpenApi.MapLike<string, OpenApi.Response | OpenApi.Reference>,
): ts.ModuleDeclaration => {
  const statements = Object.entries(responses).map(([name, response]) => {
    if (Guard.isReference(response)) {
      return factory.Interface({
        name: `TODO:${response.$ref}`,
        members: [],
      });
    }
    return Response.generateNamespace(entryPoint, currentPoint, factory, name, response);
  });

  return factory.Namespace({
    export: true,
    name: "Responses",
    statements,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#responsesObject`,
  });
};

export const generateNamespaceWithStatusCode = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  responses: OpenApi.Responses,
): ts.ModuleDeclaration => {
  const statements = Object.entries(responses).map(([statusCode, response]) => {
    if (Guard.isReference(response)) {
      return factory.Interface({
        name: `TODO:${response.$ref}`,
        members: [],
      });
    }
    return Response.generateNamespace(entryPoint, currentPoint, factory, `Status$${statusCode}`, response);
  });

  return factory.Namespace({
    export: true,
    name: "Responses",
    statements,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#responsesObject`,
  });
};
