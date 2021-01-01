import ts from "typescript";
import { OpenApi } from "./types";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as MediaType from "./MediaType";
import * as ToTypeNode from "./toTypeNode";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  requestBody: OpenApi.RequestBody,
  setReference: ToTypeNode.SetReferenceCallback,
): ts.ModuleDeclaration => {
  const contentSignatures = MediaType.generatePropertySignatures(entryPoint, currentPoint, factory, requestBody.content || {}, setReference);

  return factory.Namespace.create({
    export: true,
    name,
    comment: requestBody.description,
    statements: [
      factory.Interface({
        export: true,
        name: "Content",
        members: contentSignatures,
        comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#requestBodyObject`,
      }),
    ],
  });
};
