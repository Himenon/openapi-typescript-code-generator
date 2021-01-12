import ts from "typescript";

export interface Params$Create {
  parameters?: ts.ParameterDeclaration[];
  body?: ts.Block;
}

export interface Factory {
  create: (params: Params$Create) => ts.ConstructorDeclaration;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params$Create): ts.ConstructorDeclaration => {
  const node = factory.createConstructorDeclaration(undefined, undefined, params.parameters || [], params.body);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
