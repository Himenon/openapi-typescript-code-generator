import ts from "typescript";

export interface Params$Create {
  export?: true;
  name: string;
  type: ts.TypeNode;
}

export interface Factory {
  create: (params: Params$Create) => ts.TypeAliasDeclaration;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params$Create): ts.TypeAliasDeclaration => {
  const node = factory.createTypeAliasDeclaration(
    undefined,
    params.export && [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(params.name),
    undefined,
    params.type,
  );
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
