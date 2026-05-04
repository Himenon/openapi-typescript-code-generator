<<<<<<< HEAD
import { EOL } from "os";
=======
import { EOL } from "node:os";
import ts from "typescript";
>>>>>>> 7b64d04cab4a272c3f6e680fa294110083ae3879

import type { TsGenerator } from "../../../api";
import type { CodeGenerator } from "../../../types";
import type { Option } from "../../_shared/types";
import * as ArrowFunction from "./CurryingArrowFunction";

export const create = (factory: TsGenerator.Factory.Type, list: CodeGenerator.Params[], option: Option): string[] => {
  const variableStatements = list.map(params => {
    return factory.VariableStatement.create({
      comment: option.additionalMethodComment
        ? [params.operationParams.comment, `operationId: ${params.operationId}`, `Request URI: ${params.operationParams.requestUri}`]
            .filter(t => !!t)
            .join(EOL)
        : params.operationParams.comment,
      modifiers: ["export"],
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
