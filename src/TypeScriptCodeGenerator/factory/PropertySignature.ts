import ts from "typescript";

import { generateComment } from "./utils";

export interface Params {
  name: string;
  optional: boolean;
  type: ts.TypeNode;
  comment?: string;
}

export interface Factory {
  create: (params: Params) => ts.PropertySignature;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params): ts.PropertySignature => {
  const node = factory.createPropertySignature(
    undefined,
    params.name,
    params.optional ? factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
    params.type,
  );
  if (params.comment) {
    const comment = generateComment(params.comment);
    return ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, comment.value, comment.hasTrailingNewLine);
  }
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
