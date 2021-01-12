import ts from "typescript";

export interface Params {
  name: string | ts.BindingName;
  type?: ts.TypeNode;
  initializer?: ts.Expression;
}

export interface Factory {
  create: (params: Params) => ts.VariableDeclaration;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params): ts.VariableDeclaration => {
  const node = factory.createVariableDeclaration(params.name, undefined, params.type, params.initializer);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
