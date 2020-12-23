import * as ts from "typescript";

export interface Params {
  methodName: string;
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
    if (!ts.isClassDeclaration(node)) {
      return node;
    }
    return context.factory.updateClassDeclaration(
      node,
      node.decorators,
      node.modifiers,
      node.name,
      node.typeParameters,
      node.heritageClauses,
      node.members,
    );
  };
  return ts.visitNode(rootNode, visit);
};
