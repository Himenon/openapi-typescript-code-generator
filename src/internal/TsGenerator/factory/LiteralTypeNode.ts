import ts from "typescript";

import { generateComment } from "./utils";

export interface Params {
  value: string | boolean | number;
  comment?: string;
}

export interface Factory {
  create: (params: Params) => ts.LiteralTypeNode;
}

export const create =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] =>
  (params: Params): ts.LiteralTypeNode => {
    const createNode = () => {
      if (typeof params.value === "string") {
        const literal = ts.setEmitFlags(factory.createStringLiteral(params.value), ts.EmitFlags.NoAsciiEscaping);
        return factory.createLiteralTypeNode(literal);
      }

      if (typeof params.value === "number") {
        return factory.createLiteralTypeNode(factory.createNumericLiteral(params.value));
      }
      return factory.createLiteralTypeNode(params.value ? factory.createTrue() : factory.createFalse());
    };
    const node = createNode();
    if (params.comment) {
      const comment = generateComment(params.comment);
      return ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, comment.value, comment.hasTrailingNewLine);
    }
    return node;
  };

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
