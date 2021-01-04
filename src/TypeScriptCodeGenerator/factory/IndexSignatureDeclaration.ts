import ts from "typescript";

export interface Params$Create {
  name: string;
  type: ts.TypeNode;
}

export interface Factory {
  create: (params: Params$Create) => ts.IndexSignatureDeclaration;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params$Create): ts.IndexSignatureDeclaration => {
  const node = factory.createIndexSignature(
    undefined,
    undefined,
    // TODO もしかしたら拡張する
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

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
