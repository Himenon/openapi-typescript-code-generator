import ts from "typescript";
import * as Reference from "./Reference";
import * as Header from "./Header";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import * as Guard from "./Guard";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  headers: OpenApi.MapLike<string, OpenApi.Header | OpenApi.Reference>,
): ts.ModuleDeclaration => {
  const statements: ts.InterfaceDeclaration[] = Object.entries(headers).map(([name, header]) => {
    if (Guard.isReference(header)) {
      const alias = Reference.generate<OpenApi.Header | OpenApi.Reference>(entryPoint, currentPoint, header);
      if (alias.internal === true) {
        throw new Error("これからやります");
      }
      if (Guard.isReference(alias.data)) {
        throw new Error("これから");
      }
      return Header.generateInterface(entryPoint, alias.referencePoint, factory, name, alias.data);
    }
    return Header.generateInterface(entryPoint, currentPoint, factory, name, header);
  });
  return factory.Namespace({
    export: true,
    name: "Headers",
    statements,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#componentsObject`,
  });
};
