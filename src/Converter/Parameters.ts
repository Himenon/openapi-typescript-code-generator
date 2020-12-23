import * as ts from "typescript";
import * as Reference from "./Reference";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import * as Guard from "./Guard";

export const generate = (
  entryFilename: string,
  referenceFilename: string,
  factory: Factory.Type,
  parameters: OpenApi.MapLike<string, OpenApi.Parameter | OpenApi.Reference>,
): ts.ModuleDeclaration => {
  const interfaces = Object.entries(parameters).map(([name, parameter]) => {
    if (Guard.isReference(parameter)) {
      const alias = Reference.generate<OpenApi.MapLike<string, OpenApi.Parameter | OpenApi.Reference>>(
        entryFilename,
        referenceFilename,
        parameter,
      );
      if (alias.internal) {
        return factory.Interface({
          name: `TODO:${parameter.$ref}`,
          members: [],
        });
      }
      return generate(entryFilename, alias.referenceFilename, factory, alias.data);
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
