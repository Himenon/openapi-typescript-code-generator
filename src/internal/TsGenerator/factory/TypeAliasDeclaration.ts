import ts from "typescript";

import { generateComment } from "./utils";

export interface Params$Create {
  export?: true;
  name: string;
  type: ts.TypeNode;
  comment?: string;
  deprecated?: boolean;
}

export interface Factory {
  create: (params: Params$Create) => ts.TypeAliasDeclaration;
}

export const create =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] =>
  (params: Params$Create): ts.TypeAliasDeclaration => {
    const node = factory.createTypeAliasDeclaration(
      params.export && [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      factory.createIdentifier(params.name),
      undefined,
      params.type,
    );
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
