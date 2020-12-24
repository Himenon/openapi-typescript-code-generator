import * as ts from "typescript";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import * as Guard from "./Guard";
import * as Header from "./Header";
import * as MediaType from "./MediaType";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  response: OpenApi.Response,
): ts.ModuleDeclaration => {
  const headerInterfaces = Object.entries(response.headers || {}).reduce<ts.InterfaceDeclaration[]>((previous, [name, header]) => {
    if (Guard.isReference(header)) {
      throw new Error("対応中");
    }
    return previous.concat(Header.generateInterface(entryPoint, currentPoint, factory, name, header));
  }, []);
  const contentSignatures = MediaType.generatePropertySignatures(entryPoint, currentPoint, factory, response.content || {});

  return factory.Namespace({
    export: true,
    name,
    comment: response.description,
    statements: [
      factory.Namespace({
        export: true,
        name: "Header",
        statements: headerInterfaces,
        comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#headerObject`,
      }),
      factory.Interface({
        export: true,
        name: "Content",
        members: contentSignatures,
        comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#mediaTypeObject`,
      }),
    ],
  });
};
