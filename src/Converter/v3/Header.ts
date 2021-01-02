import ts from "typescript";

import { Factory } from "../../TypeScriptCodeGenerator";
import * as ToTypeNode from "./toTypeNode";
import { OpenApi } from "./types";

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  header: OpenApi.Header,
  context: ToTypeNode.Context,
): ts.PropertySignature[] => {
  const signatures: ts.PropertySignature[] = [
    factory.Property({
      name: "required",
      optional: false,
      type: factory.LiteralTypeNode({ value: !!header.required }),
    }),
  ];

  if (header.schema) {
    signatures.push(
      factory.Property({
        name: "schema",
        optional: false,
        type: ToTypeNode.convert(entryPoint, currentPoint, factory, header.schema, context),
      }),
    );
  }

  return signatures;
};

export const generateInterface = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  header: OpenApi.Header,
  context: ToTypeNode.Context,
): ts.InterfaceDeclaration => {
  return factory.Interface({
    export: true,
    name,
    deprecated: header.deprecated,
    comment: header.description,
    members: generatePropertySignatures(entryPoint, currentPoint, factory, header, context),
  });
};
