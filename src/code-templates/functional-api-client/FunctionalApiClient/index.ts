import ts from "typescript";

import type { TsGenerator } from "../../../api";
import type { CodeGenerator } from "../../../types";
import type { Option } from "../types";
import * as Method from "./Method";

export { Method };

export const create = (factory: TsGenerator.Factory.Type, list: CodeGenerator.Params[], option: Option): ts.Block => {
  const variableStatements = list.map(params => {
    return Method.create(factory, params, option);
  });
  
  return factory.Block.create({
    statements: [
      ...variableStatements,
    ],
    multiLine: true,
  })
};
