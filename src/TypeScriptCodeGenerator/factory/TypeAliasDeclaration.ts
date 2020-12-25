import * as ts from "typescript";

export interface Params {
  export?: true;
  name: string;
  typeNode: ts.TypeNode;
}

export type Factory = (params: Params) => ts.TypeAliasDeclaration;

export const create = ({ factory }: ts.TransformationContext): Factory => (params: Params): ts.TypeAliasDeclaration => {
  const node = factory.createTypeAliasDeclaration(
    undefined,
    params.export && [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(params.name),
    undefined,
    params.typeNode,
  );
  return node;
};
