import * as ts from "typescript";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import * as Guard from "./Guard";

export const generate = (
  factory: Factory.Type,
  parameters: OpenApi.MapLike<string, OpenApi.Parameter | OpenApi.Reference>,
): ts.ModuleDeclaration => {
  const interfaces = Object.entries(parameters).map(([name, parameter]) => {
    if (Guard.isReference(parameter)) {
      return factory.Interface({
        name: `TODO:${parameter.$ref}`,
        members: [],
      });
    }
    return factory.Interface({
      export: true,
      name,
      comment: parameter.description,
      members: [
        factory.Property({
          name: "name",
          type: factory.LiteralTypeNode({ value: parameter.name }),
        }),
        factory.Property({
          name: "in",
          type: factory.LiteralTypeNode({ value: parameter.in }),
        }),
        factory.Property({
          name: "required",
          type: factory.LiteralTypeNode({ value: parameter.required }),
        }),
      ],
    });
  });

  return factory.Namespace({
    export: true,
    name: "Parameters",
    statements: interfaces,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#parameterObject`,
  });
};
