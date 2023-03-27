import ts from "typescript";

import type { TsGenerator } from "../../../api";
import type { CodeGenerator } from "../../../types";
import type { Option } from "../../_shared/types";
import * as ArrowFunction from "./ArrowFunction";

export const create = (factory: TsGenerator.Factory.Type, list: CodeGenerator.Params[], option: Option): ts.VariableStatement[] => {
  return list.map(params => {
    return factory.VariableStatement.create({
      modifiers: [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
      declarationList: factory.VariableDeclarationList.create({
        declarations: [
          factory.VariableDeclaration.create({
            name: params.convertedParams.functionName,
            initializer: ArrowFunction.create(factory, params, option),
          }),
        ],
        flag: "const",
      }),
    });
  });
};
