import ts from "typescript";

export interface Params$Create {
  parameters?: ts.ParameterDeclaration[];
  body?: ts.Block;
}

export interface Factory {
  create: (params: Params$Create) => ts.ConstructorDeclaration;
}

export const create =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] =>
  (params: Params$Create): ts.ConstructorDeclaration => {
    const node = factory.createConstructorDeclaration(undefined, params.parameters || [], params.body);
    return node;
  };

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
