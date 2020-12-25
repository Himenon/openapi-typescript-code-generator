import * as ts from "typescript";
import { generateComment } from "./utils";

export interface Params {
  name: string;
  optional?: true;
  type: ts.TypeNode;
  comment?: string;
}

export type Factory = (params: Params) => ts.PropertySignature;

export const create = ({ factory }: ts.TransformationContext): Factory => (params: Params): ts.PropertySignature => {
  const node = factory.createPropertySignature(
    undefined,
    params.name,
    params.optional && factory.createToken(ts.SyntaxKind.QuestionToken),
    params.type,
  );
  if (params.comment) {
    const comment = generateComment(params.comment);
    return ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, comment.value, comment.hasTrailingNewLine);
  }
  return node;
};
