import { generateComment } from "./utils";
import * as ts from "typescript";

export interface Params {
  export?: true;
  name: string;
  statements: ts.Statement[];
  comment?: string;
  deprecated?: boolean;
}

export type Factory = (params: Params) => ts.ModuleDeclaration;

export const create = ({ factory }: ts.TransformationContext): Factory => (params: Params): ts.ModuleDeclaration => {
  const node = factory.createModuleDeclaration(
    undefined,
    params.export && [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(params.name),
    factory.createModuleBlock(params.statements),
    ts.NodeFlags.Namespace,
  );
  if (params.comment) {
    const comment = generateComment(params.comment, params.deprecated);
    return ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, comment.value, comment.hasTrailingNewLine);
  }
  return node;
};
