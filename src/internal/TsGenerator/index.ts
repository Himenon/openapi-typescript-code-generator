import ts from "typescript";

import { DevelopmentError } from "../Exception";
import * as Factory from "./factory";
import { CreateFunction, traverse } from "./traverse";

export * as Utils from "./utils";

export { type CreateFunction, Factory };

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
    throw new DevelopmentError("Invalid length");
  }
  return convertAstToTypeScriptCode(result.transformed[0]);
};
