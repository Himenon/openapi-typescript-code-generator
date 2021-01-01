import ts from "typescript";
import * as Reference from "./Reference";
import * as RequestBody from "./RequestBody";
import { OpenApi } from "./types";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as Guard from "./Guard";
import { Store } from "./store";
import * as ToTypeNode from "./toTypeNode";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  requestBodies: OpenApi.MapLike<string, OpenApi.RequestBody | OpenApi.Reference>,
  context: ToTypeNode.Context,
): ts.ModuleDeclaration => {
  const statements = Object.entries(requestBodies).map(([name, requestBody]) => {
    if (Guard.isReference(requestBody)) {
      const alias = Reference.generate<OpenApi.MapLike<string, OpenApi.RequestBody | OpenApi.Reference>>(entryPoint, currentPoint, requestBody);
      if (alias.type === "local") {
        return factory.Interface({
          name: `TODO:${requestBody.$ref}`,
          members: [],
        });
      }
      return generateNamespace(entryPoint, alias.referencePoint, store, factory, alias.data, context);
    }
    return RequestBody.generateNamespace(entryPoint, currentPoint, factory, name, requestBody, context);
  });
  return factory.Namespace.create({
    export: true,
    name: "RequestBodies",
    statements,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#componentsObject`,
  });
};
