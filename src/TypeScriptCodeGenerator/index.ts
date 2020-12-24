import * as ts from "typescript";
import { traverse, CreateFunction } from "./traverse";
import * as Factory from "./factory";

export { CreateFunction, Factory };

export type TransformerFactory<T extends ts.Node> = ts.TransformerFactory<T>;

export const convertAstToTypeScriptCode = (sourceFile: ts.SourceFile): string => {
  const printer = ts.createPrinter(); // AST -> TypeScriptに変換
  return printer.printFile(sourceFile);
};

export const generate = (createFunction: CreateFunction): string => {
  const source = ts.createSourceFile("", "", ts.ScriptTarget.ESNext);
  const transformers: TransformerFactory<ts.SourceFile>[] = [traverse(createFunction)];
  const result = ts.transform(source, transformers);
  result.dispose();
  if (result.transformed.length > 1) {
    throw new Error("1個以上あるよ");
  }
  return convertAstToTypeScriptCode(result.transformed[0]);
};
