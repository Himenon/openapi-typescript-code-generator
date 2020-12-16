import * as ts from "typescript";
import { convertAstToTypeScriptCode } from "./convertAstToTypeScriptCode";
import * as Types from "./types";

export const transform = (code: string, transformers: Types.TransformerFactory<ts.SourceFile>[] = []) => {
  const source = ts.createSourceFile("", code, ts.ScriptTarget.ESNext);
  const result = ts.transform(source, transformers);
  result.dispose();
  if (result.transformed.length > 1) {
    console.error(result.transformed);
    throw new Error("1個以上あるよ");
  }
  return convertAstToTypeScriptCode(result.transformed[0]);
};
