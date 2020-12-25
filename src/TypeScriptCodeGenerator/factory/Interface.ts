import { generateComment } from "./utils";
import * as ts from "typescript";

export interface Params {
  export?: true;
  deprecated?: boolean;
  name: string;
  members: readonly ts.TypeElement[];
  comment?: string;
}

export type Factory = (params: Params) => ts.InterfaceDeclaration;

export const create = ({ factory }: ts.TransformationContext): Factory => (params: Params): ts.InterfaceDeclaration => {
  const node = factory.createInterfaceDeclaration(
    undefined,
    params.export && [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(params.name),
    undefined,
    undefined,
    params.members,
  );
  if (params.comment) {
    const comment = generateComment(params.comment, params.deprecated);
    return ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, comment.value, comment.hasTrailingNewLine);
  }
  return node;
};
