import ts from "typescript";

import type { CodeGenerator } from "../../types";

export const stringToStatements = (code: string): ts.Statement[] => {
  const source = ts.createSourceFile("", code, ts.ScriptTarget.ESNext, false, ts.ScriptKind.TS);
  return Array.from(source.statements);
};

export const convertIntermediateCodes = (intermediateCodes: CodeGenerator.IntermediateCode[]): ts.Statement[] => {
  return intermediateCodes.reduce<ts.Statement[]>((result, intermediateCode) => {
    if (typeof intermediateCode === "string") {
      return [...result, ...stringToStatements(intermediateCode)];
    }
    return result.concat(intermediateCode);
  }, []);
};
