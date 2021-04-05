import ts from "typescript";

export interface Params$Create {
  name: string;
  export?: true;
  members: readonly ts.ClassElement[];
  typeParameterDeclaration: readonly ts.TypeParameterDeclaration[];
}

export interface Factory {
  create: (params: Params$Create) => ts.ClassDeclaration;
}

export const create = ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] => (params: Params$Create): ts.ClassDeclaration => {
  const node = factory.createClassDeclaration(
    undefined,
    params.export && [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(params.name),
    params.typeParameterDeclaration,
    undefined,
    params.members,
  );
  return node;
};

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
