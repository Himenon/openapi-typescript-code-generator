import { EOL } from "os";
import ts from "typescript";

import type { TsGenerator } from "../../../api";
import type { CodeGenerator } from "../../../types";
import type { Option } from "../../_shared/types";
import * as ArrowFunction from "./CurryingArrowFunction";

export const create = (factory: TsGenerator.Factory.Type, list: CodeGenerator.Params[], option: Option): ts.Statement[] => {
  const variableStatements = list.map(params => {
    return factory.VariableStatement.create({
      comment: option.additionalMethodComment
        ? [params.operationParams.comment, `operationId: ${params.operationId}`, `Request URI: ${params.operationParams.requestUri}`]
            .filter(t => !!t)
            .join(EOL)
        : params.operationParams.comment,
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

  return variableStatements;
};
