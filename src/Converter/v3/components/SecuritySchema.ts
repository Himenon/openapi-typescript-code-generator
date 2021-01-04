import ts from "typescript";

import { Factory } from "../../../TypeScriptCodeGenerator";
import { OpenApi } from "../types";

export const generatePropertySignatures = (
  _entryPoint: string,
  _currentPoint: string,
  factory: Factory.Type,
  securitySchema: OpenApi.SecuritySchema,
): ts.PropertySignature[] => {
  const signatures: ts.PropertySignature[] = [
    factory.PropertySignature.create({
      name: "type",
      optional: false,
      type: factory.LiteralTypeNode.create({ value: securitySchema.type }),
    }),
    factory.PropertySignature.create({
      name: "name",
      optional: false,
      type: factory.LiteralTypeNode.create({ value: securitySchema.name }),
    }),
    factory.PropertySignature.create({
      name: "in",
      optional: false,
      type: factory.LiteralTypeNode.create({ value: securitySchema.in }),
    }),
    factory.PropertySignature.create({
      name: "openIdConnectUrl",
      optional: false,
      type: factory.LiteralTypeNode.create({ value: securitySchema.openIdConnectUrl }),
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
  return factory.InterfaceDeclaration.create({
    export: true,
    name,
    comment: securitySchema.description,
    members: generatePropertySignatures(entryPoint, currentPoint, factory, securitySchema),
  });
};
