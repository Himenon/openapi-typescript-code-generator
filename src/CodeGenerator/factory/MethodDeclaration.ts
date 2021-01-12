import ts from "typescript";

import { generateComment } from "./utils";

export interface Params$Create {
  name: string;
  async?: boolean;
  private?: boolean;
  typeParameters?: readonly ts.TypeParameterDeclaration[];
  parameters?: ts.ParameterDeclaration[];
  type?: ts.TypeNode;
  body?: ts.Block;
  comment?: string;
  deprecated?: boolean;
}

export interface Factory {
  create: (params: Params$Create) => ts.MethodDeclaration;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params$Create): ts.MethodDeclaration => {
  const modifiers: ts.Modifier[] = [];
  if (params.private) {
    modifiers.push(factory.createModifier(ts.SyntaxKind.PrivateKeyword));
  } else {
    modifiers.push(factory.createModifier(ts.SyntaxKind.PublicKeyword));
  }
  if (params.async) {
    modifiers.push(factory.createModifier(ts.SyntaxKind.AsyncKeyword));
  }
  const node = factory.createMethodDeclaration(
    undefined,
    modifiers,
    undefined,
    factory.createIdentifier(params.name),
    undefined,
    params.typeParameters,
    params.parameters || [],
    params.type,
    params.body,
  );
  if (params.comment) {
    const comment = generateComment(params.comment, params.deprecated);
    return ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, comment.value, comment.hasTrailingNewLine);
  }
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
