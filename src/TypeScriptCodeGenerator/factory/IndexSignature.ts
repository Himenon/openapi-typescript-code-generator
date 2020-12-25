import * as ts from "typescript";

export interface Params {
  name: string;
  type: ts.TypeNode;
}

export type Factory = (params: Params) => ts.IndexSignatureDeclaration;

export const create = ({ factory }: ts.TransformationContext): Factory => (params: Params): ts.IndexSignatureDeclaration => {
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
