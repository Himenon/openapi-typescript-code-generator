import type { OpenApi } from "../../../types";
import type { Factory } from "../../TsGenerator";

export const generatePropertySignatures = (
  _entryPoint: string,
  _currentPoint: string,
  factory: Factory.Type,
  securitySchema: OpenApi.SecuritySchema,
): string[] => {
  const properties: Array<[string, string | boolean | undefined]> = [
    ["type", securitySchema.type],
    ["deprecated", securitySchema.deprecated],
    ["name", securitySchema.name],
    ["in", securitySchema.in],
    ["scheme", securitySchema.scheme],
    ["bearerFormat", securitySchema.bearerFormat],
    ["openIdConnectUrl", securitySchema.openIdConnectUrl],
  ];
  return properties.flatMap(([name, value]) => {
    if (value === undefined) {
      return [];
    }
    return [
      factory.PropertySignature.create({
        readOnly: false,
        name,
        optional: false,
        type: factory.LiteralTypeNode.create({ value }),
      }),
    ];
  });
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
