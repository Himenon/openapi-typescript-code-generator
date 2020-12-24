import { EOL } from "os";
import * as ts from "typescript";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import { convert } from "./toTypeNode";

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  header: OpenApi.Header,
): ts.PropertySignature[] => {
  return [
    factory.Property({
      name: "required",
      type: factory.LiteralTypeNode({ value: !!header.required }),
    }),
    header.schema &&
      factory.Property({
        name: "schema",
        type: convert(entryPoint, currentPoint, factory, header.schema),
      }),
  ].filter(Boolean) as ts.PropertySignature[];
};

export const generateInterface = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  header: OpenApi.Header,
): ts.InterfaceDeclaration => {
  return factory.Interface({
    export: true,
    name,
    comment: header.deprecated ? ["@deprecated", header.description].join(EOL) : header.description,
    members: generatePropertySignatures(entryPoint, currentPoint, factory, header),
  });
};
