import * as ts from "typescript";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import * as ToTypeNode from "./toTypeNode";
import * as Guard from "./Guard";

export const generate = (factory: Factory.Type, responses: OpenApi.MapLike<string, OpenApi.Response | OpenApi.Reference>): ts.ModuleDeclaration => {
  const interfaces = Object.entries(responses).map(([name, response]) => {
    if (Guard.isReference(response)) {
      return factory.Interface({
        name: `TODO:${response.$ref}`,
        members: [],
      });
    }
  });
  return factory.Namespace({
    export: true,
    name: "Components",
    statements: [],
  });
};
