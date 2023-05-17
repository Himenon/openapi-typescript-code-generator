import ts from "typescript";
import { generateComment } from "./utils";

export interface Params {
  comment?: string;
  deprecated?: boolean;
  modifiers?: ts.Modifier[];
  declarationList: ts.VariableDeclarationList | ts.VariableDeclaration[];
}

export interface Factory {
  create: (params: Params) => ts.VariableStatement;
}

export const create =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] =>
  (params: Params): ts.VariableStatement => {
    const node = factory.createVariableStatement(params.modifiers, params.declarationList);
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
