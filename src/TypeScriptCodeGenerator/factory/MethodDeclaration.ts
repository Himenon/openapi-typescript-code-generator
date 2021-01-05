import ts from "typescript";

export interface Params$Create {
  name: string;
  private?: boolean;
  parameters?: ts.ParameterDeclaration[];
  type?: ts.TypeNode;
  body?: ts.Block;
}

export interface Factory {
  create: (params: Params$Create) => ts.MethodDeclaration;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params$Create): ts.MethodDeclaration => {
  const node = factory.createMethodDeclaration(
    undefined,
    [params.private ? factory.createModifier(ts.SyntaxKind.PrivateKeyword) : factory.createModifier(ts.SyntaxKind.PublicKeyword)],
    undefined,
    factory.createIdentifier(params.name),
    undefined,
    undefined,
    params.parameters || [],
    params.type,
    params.body,
  );
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
