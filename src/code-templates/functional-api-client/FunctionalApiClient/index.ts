import ts from "typescript";

import type { TsGenerator } from "../../../api";
import type { CodeGenerator } from "../../../types";
import type { Option } from "../types";
import * as Method from "./Method";
import * as ReturnStatement from "./ReturnStatement";
export { Method };

export const create = (factory: TsGenerator.Factory.Type, list: CodeGenerator.Params[], option: Option): ts.VariableStatement => {
  const variableStatements = list.map(params => {
    return Method.create(factory, params, option);
  });

  const arrowFunction = factory.ArrowFunction.create({
    typeParameters: [
      factory.TypeParameterDeclaration.create({
        name: "RequestOption",
      }),
    ],
    parameters: [
      factory.ParameterDeclaration.create({
        name: "baseUrl",
        type: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
      }),
    ],
    body: factory.Block.create({
      statements: [...variableStatements, ReturnStatement.create(factory, list)],
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
