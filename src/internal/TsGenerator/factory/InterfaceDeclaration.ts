import ts from "typescript";

import { escapeIdentiferText, generateComment } from "./utils";

export interface Params$Create {
  export?: true;
  deprecated?: boolean;
  name: string;
  members: readonly ts.TypeElement[];
  typeParameters?: readonly ts.TypeParameterDeclaration[];
  comment?: string;
}

export interface Factory {
  create: (params: Params$Create) => ts.InterfaceDeclaration;
}

export const create = ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] => (
  params: Params$Create,
): ts.InterfaceDeclaration => {
  const node = factory.createInterfaceDeclaration(
    undefined,
    params.export && [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(escapeIdentiferText(params.name)),
    params.typeParameters,
    undefined,
    params.members,
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
