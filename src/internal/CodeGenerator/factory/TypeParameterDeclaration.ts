import ts from "typescript";

export interface Params$Create {
  name: string;
  constraint?: ts.TypeNode;
  defaultType?: ts.TypeNode;
}

export interface Factory {
  create: (params: Params$Create) => ts.TypeParameterDeclaration;
}

export const create = ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] => (params: Params$Create): ts.TypeParameterDeclaration => {
  const node = factory.createTypeParameterDeclaration(factory.createIdentifier(params.name), params.constraint, params.defaultType);
  return node;
};

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
