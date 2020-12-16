import * as ts from "typescript";

export interface Params {
  name: string;
}

/**
 * interface名をrenameする
 */
export const traverse = (params: Params) => <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T) => {
  const visit = (node: ts.Node): ts.Node => {
    node = ts.visitEachChild(node, visit, context);
    if (ts.isSourceFile(node) && node.statements.length !== 1) {
      throw new Error("only one interface traverse");
    }
    if (!ts.isInterfaceDeclaration(node)) {
      return node;
    }
    const name = context.factory.createIdentifier(params.name);
    return context.factory.updateInterfaceDeclaration(node, undefined, undefined, name, undefined, undefined, []);
  };
  return ts.visitNode(rootNode, visit);
};
