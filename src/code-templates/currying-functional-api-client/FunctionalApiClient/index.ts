import { EOL } from "os";
import ts from "typescript";

import type { TsGenerator } from "../../../api";
import type { CodeGenerator } from "../../../types";
import type { Option } from "../../_shared/types";
import * as ArrowFunction from "./CurryingArrowFunction";

export const create = (factory: TsGenerator.Factory.Type, list: CodeGenerator.Params[], option: Option): ts.VariableStatement => {
  const properties = list.map(params => {
    return factory.PropertyAssignment.create({
      name: params.convertedParams.functionName,
      initializer: ArrowFunction.create(factory, params, option),
      comment: option.additionalMethodComment
        ? [params.operationParams.comment, `operationId: ${params.operationId}`, `Request URI: ${params.operationParams.requestUri}`]
            .filter(t => !!t)
            .join(EOL)
        : params.operationParams.comment,
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
      statements: [
        factory.VariableStatement.create({
          declarationList: factory.VariableDeclarationList.create({
            flag: "const",
            declarations: [
              factory.VariableDeclaration.create({
                name: "_baseUrl",
                initializer: factory.CallExpression.create({
                  expression: factory.PropertyAccessExpression.create({
                    expression: "baseUrl",
                    name: "replace",
                  }),
                  argumentsArray: [factory.RegularExpressionLiteral.create({ text: "/\\/$/" }), factory.StringLiteral.create({ text: "" })],
                }),
              }),
            ],
          }),
        }),
        returnValue,
      ],
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
