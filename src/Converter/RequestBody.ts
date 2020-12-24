import * as ts from "typescript";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import * as MediaType from "./MediaType";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  requestBody: OpenApi.RequestBody,
): ts.ModuleDeclaration => {
  const contentSignatures = MediaType.generatePropertySignatures(entryPoint, currentPoint, factory, requestBody.content || {});

  return factory.Namespace({
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
