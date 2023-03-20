import ts from "typescript";

import type { TsGenerator } from "../../../api";
import type { CodeGenerator } from "../../../types";
import type { Option } from "../../_shared/types";
import * as ArrowFunction from "./Method";
export { ArrowFunction as Method };

export const create = (factory: TsGenerator.Factory.Type, list: CodeGenerator.Params[], option: Option): ts.VariableStatement => {
  const properties = list.map(params => {
    return factory.PropertyAssignment.create({
      name: params.convertedParams.functionName,
      initializer: ArrowFunction.create(factory, params, option),
    });
  });

  const returnValue = factory.ReturnStatement.create({
    expression: factory.ObjectLiteralExpression.create({
      properties,
      multiLine: true,
    }),
  });

  const arrowFunction = factory.ArrowFunction.create({
    typeParameters: [
      factory.TypeParameterDeclaration.create({
        name: "RequestOption",
      }),
    ],
    parameters: [
      factory.ParameterDeclaration.create({
        name: "apiClient",
        type: factory.TypeReferenceNode.create({
          name: "ApiClient",
          typeArguments: [
            factory.TypeReferenceNode.create({
              name: "RequestOption",
            }),
          ],
        }),
      }),
      factory.ParameterDeclaration.create({
        name: "baseUrl",
        type: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
      }),
    ],
    body: factory.Block.create({
      statements: [returnValue],
      multiLine: true,
    }),
  });

  return factory.VariableStatement.create({
    modifiers: [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    declarationList: factory.VariableDeclarationList.create({
      declarations: [
        factory.VariableDeclaration.create({
          name: "createClient",
          initializer: arrowFunction,
        }),
      ],
      flag: "const",
    }),
  });
};
