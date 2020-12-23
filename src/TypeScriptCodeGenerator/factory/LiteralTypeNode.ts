import { generateComment } from "./utils";
import * as ts from "typescript";

export interface Params {
  value: string | boolean;
  comment?: string;
}

export type Factory = (params: Params) => ts.LiteralTypeNode;

export const create = ({ factory }: ts.TransformationContext): Factory => (params: Params): ts.LiteralTypeNode => {
  const createNode = () => {
    if (typeof params.value === "string") {
      return factory.createLiteralTypeNode(factory.createStringLiteral(params.value));
    }
    return factory.createLiteralTypeNode(params.value ? factory.createTrue() : factory.createFalse());
  };
  const node = createNode();
  if (params.comment) {
    return ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, generateComment(params.comment), true);
  }
  return node;
};
