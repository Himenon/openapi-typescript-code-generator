import ts from "typescript";

export interface Params$Create {
  typeParameters: readonly ts.TypeParameterDeclaration[] | undefined;
  parameters: readonly ts.ParameterDeclaration[];
  type: ts.TypeNode;
}

export interface Factory {
  create: (params: Params$Create) => ts.FunctionTypeNode;
}

export const create = ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] => (
  params: Params$Create,
): ts.FunctionTypeNode => {
  const node = factory.createFunctionTypeNode(params.typeParameters, params.parameters, params.type);
  return node;
};

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
