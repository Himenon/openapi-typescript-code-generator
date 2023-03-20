import ts from "typescript";

import type { TsGenerator } from "../../../api";
import type { CodeGenerator } from "../../../types";

export const create = (factory: TsGenerator.Factory.Type, list: CodeGenerator.Params[]): ts.ReturnStatement => {
  const properties = list.map(item => {
    return factory.ShorthandPropertyAssignment.create({
      name: item.convertedParams.functionName,
    });
  });

  return factory.ReturnStatement.create({
    expression: factory.ObjectLiteralExpression.create({
      properties,
    }),
  });
};
