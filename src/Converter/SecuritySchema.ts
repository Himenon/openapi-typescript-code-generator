import * as ts from "typescript";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";

export const generatePropertySignatures = (
  _entryPoint: string,
  _currentPoint: string,
  factory: Factory.Type,
  securitySchema: OpenApi.SecuritySchema,
): ts.PropertySignature[] => {
  const signatures: ts.PropertySignature[] = [
    factory.Property({
      name: "type",
      type: factory.LiteralTypeNode({ value: securitySchema.type }),
    }),
    factory.Property({
      name: "name",
      type: factory.LiteralTypeNode({ value: securitySchema.name }),
    }),
    factory.Property({
      name: "in",
      type: factory.LiteralTypeNode({ value: securitySchema.in }),
    }),
    factory.Property({
      name: "openIdConnectUrl",
      type: factory.LiteralTypeNode({ value: securitySchema.openIdConnectUrl }),
    }),
  ];

  return signatures;
};

export const generateInterface = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  securitySchema: OpenApi.SecuritySchema,
): ts.InterfaceDeclaration => {
  return factory.Interface({
    export: true,
    name,
    comment: securitySchema.description,
    members: generatePropertySignatures(entryPoint, currentPoint, factory, securitySchema),
  });
};
