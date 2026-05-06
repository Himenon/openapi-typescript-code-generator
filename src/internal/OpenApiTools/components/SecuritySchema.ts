import type { OpenApi } from "../../../types";
import type { Factory } from "../../TsGenerator";

export const generatePropertySignatures = (
  _entryPoint: string,
  _currentPoint: string,
  factory: Factory.Type,
  securitySchema: OpenApi.SecuritySchema,
): string[] => {
  return [
    factory.PropertySignature.create({
      readOnly: false,
      name: "type",
      optional: false,
      type: factory.LiteralTypeNode.create({ value: securitySchema.type }),
    }),
    factory.PropertySignature.create({
      readOnly: false,
      name: "name",
      optional: false,
      type: factory.LiteralTypeNode.create({ value: securitySchema.name }),
    }),
    factory.PropertySignature.create({
      readOnly: false,
      name: "in",
      optional: false,
      type: factory.LiteralTypeNode.create({ value: securitySchema.in }),
    }),
    factory.PropertySignature.create({
      readOnly: false,
      name: "openIdConnectUrl",
      optional: false,
      type: factory.LiteralTypeNode.create({ value: securitySchema.openIdConnectUrl }),
    }),
  ];
};

export const generateInterface = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  securitySchema: OpenApi.SecuritySchema,
): string => {
  return factory.InterfaceDeclaration.create({
    export: true,
    name,
    comment: securitySchema.description,
    members: generatePropertySignatures(entryPoint, currentPoint, factory, securitySchema),
  });
};
