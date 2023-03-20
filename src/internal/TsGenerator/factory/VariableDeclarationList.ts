import ts from "typescript";
import { generateComment } from "./utils";

const flags = {
  const: ts.NodeFlags.Const,
} as const;

export interface Params {
  declarations: readonly ts.VariableDeclaration[];
  flag: keyof typeof flags;
  comment?: string;
  deprecated?: boolean;
}

export interface Factory {
  create: (params: Params) => ts.VariableDeclarationList;
}

export const create =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] =>
  (params: Params): ts.VariableDeclarationList => {
    const node = factory.createVariableDeclarationList(params.declarations, flags[params.flag]);
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
