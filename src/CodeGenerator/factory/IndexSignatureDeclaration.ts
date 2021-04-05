import ts from "typescript";

export interface Params$Create {
  name: string;
  type: ts.TypeNode;
}

export interface Factory {
  create: (params: Params$Create) => ts.IndexSignatureDeclaration;
}

export const create = ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] => (params: Params$Create): ts.IndexSignatureDeclaration => {
  const node = factory.createIndexSignature(
    undefined,
    undefined,
    // TODO Feature Development: Refactoring
    [
      factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        factory.createIdentifier(params.name),
        undefined,
        factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
        undefined,
      ),
    ],
    params.type,
  );
  return node;
};

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
