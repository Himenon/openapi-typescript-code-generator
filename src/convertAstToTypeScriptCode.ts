import * as ts from "typescript";

export const convertAstToTypeScriptCode = (sourceFile: ts.SourceFile): string => {
  const printer = ts.createPrinter(); // AST -> TypeScriptに変換
  return printer.printFile(sourceFile);
};
