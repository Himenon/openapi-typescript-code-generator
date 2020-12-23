import { generateComment } from "./utils";
import * as ts from "typescript";

export interface Params {
  export?: true;
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
    return ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, generateComment(params.comment), true);
  }
  return node;
};
