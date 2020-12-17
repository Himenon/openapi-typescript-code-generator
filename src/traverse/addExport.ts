import * as ts from "typescript";

export interface Params {
  name: string;
}

/**
 * interface名をrenameする
 */
export const traverse = () => <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T) => {
  const visit = (node: ts.Node): ts.Node => {
    node = ts.visitEachChild(node, visit, context);
    if (ts.isSourceFile(node) && node.statements.length !== 1) {
      throw new Error("only one interface traverse");
    }
    if (!ts.isInterfaceDeclaration(node)) {
      return node;
    }
    return context.factory.updateInterfaceDeclaration(
      node,
      undefined,
      [context.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      node.name,
      undefined,
      undefined,
      node.members,
    );
  };
  return ts.visitNode(rootNode, visit);
};
