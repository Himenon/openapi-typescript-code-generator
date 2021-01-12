import ts from "typescript";

export interface Params$Create {
  name: string;
  constraint?: ts.TypeNode;
}

export interface Factory {
  create: (params: Params$Create) => ts.TypeParameterDeclaration;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params$Create): ts.TypeParameterDeclaration => {
  const node = factory.createTypeParameterDeclaration(factory.createIdentifier(params.name), params.constraint, undefined);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
