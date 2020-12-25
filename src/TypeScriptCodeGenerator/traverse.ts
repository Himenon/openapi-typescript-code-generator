import ts from "typescript";

export type CreateFunction = (context: ts.TransformationContext) => ts.Statement[];

export const traverse = (create: CreateFunction) => <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T) => {
  const visit = (node: ts.Node): ts.Node => {
    if (!ts.isSourceFile(node)) {
      return node;
    }
    return context.factory.updateSourceFile(
      node,
      create(context),
      node.isDeclarationFile,
      node.referencedFiles,
      node.typeReferenceDirectives,
      node.hasNoDefaultLib,
      node.libReferenceDirectives,
    );
  };
  return ts.visitNode(rootNode, visit);
};
