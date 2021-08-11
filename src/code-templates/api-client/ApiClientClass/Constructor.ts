import ts from "typescript";

import type { TsGenerator } from "../../../api";

/**
 * constructor(private apiClient: ApiClient, private baseUrl: string) { }
 */
export const create = (factory: TsGenerator.Factory.Type): ts.ConstructorDeclaration => {
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
    name: "baseUrl",
    type: factory.TypeNode.create({
      type: "string",
    }),
  });

  return factory.ConstructorDeclaration.create({
    parameters: [parameter1, parameter2],
    body: factory.Block.create({
      statements: [
        factory.ExpressionStatement.create({
          expression: factory.BinaryExpression.create({
            left: factory.PropertyAccessExpression.create({
              expression: "this",
              name: "baseUrl",
            }),
            operator: "=",
            right: factory.CallExpression.create({
              expression: factory.PropertyAccessExpression.create({
                expression: "baseUrl",
                name: "replace",
              }),
              argumentsArray: [factory.RegularExpressionLiteral.create({ text: "/\\/$/" }), factory.StringLiteral.create({ text: "" })],
            }),
          }),
        }),
      ],
      multiLine: false,
    }),
  });
};
