import ts from "typescript";
import { generateComment } from "./utils";

export interface Params {
  name: string;
  initializer: ts.Expression;
  comment?: string;
  deprecated?: boolean;
}

export interface Factory {
  create: (params: Params) => ts.PropertyAssignment;
}

export const create =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] =>
  (params: Params): ts.PropertyAssignment => {
    const node = factory.createPropertyAssignment(params.name, params.initializer);
    if (params.comment) {
      const comment = generateComment(params.comment, params.deprecated);
      return ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, comment.value, comment.hasTrailingNewLine);
    }
    return node;
  };

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
