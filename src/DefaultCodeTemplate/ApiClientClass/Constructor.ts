import ts from "typescript";

import type { Factory } from "../../factory";

/**
 * constructor(private apiClient: ApiClient, private baseUrl: string) { }
 */
export const create = (factory: Factory.Type): ts.ConstructorDeclaration => {
  const parameter1 = factory.ParameterDeclaration.create({
    modifiers: "private",
    name: "apiClient",
    type: factory.TypeReferenceNode.create({
      name: "ApiClient",
      typeArguments: [
        factory.TypeReferenceNode.create({
          name: "RequestOption",
        }),
      ],
    }),
  });
  const parameter2 = factory.ParameterDeclaration.create({
    modifiers: "private",
    name: "baseUrl",
    type: factory.TypeNode.create({
      type: "string",
    }),
  });
  return factory.ConstructorDeclaration.create({
    parameters: [parameter1, parameter2],
    body: factory.Block.create({
      statements: [],
      multiLine: false,
    }),
  });
};
