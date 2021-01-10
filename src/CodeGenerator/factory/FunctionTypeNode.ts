import ts from "typescript";

export interface Params$Create {
  typeParameters: readonly ts.TypeParameterDeclaration[] | undefined;
  parameters: readonly ts.ParameterDeclaration[];
  type: ts.TypeNode;
}

export interface Factory {
  create: (params: Params$Create) => ts.FunctionTypeNode;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params$Create): ts.FunctionTypeNode => {
  const node = factory.createFunctionTypeNode(params.typeParameters, params.parameters, params.type);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
