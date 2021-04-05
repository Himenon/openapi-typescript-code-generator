import ts from "typescript";

export interface Params {
  declarationList: ts.VariableDeclarationList | ts.VariableDeclaration[];
}

export interface Factory {
  create: (params: Params) => ts.VariableStatement;
}

export const create = ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] => (params: Params): ts.VariableStatement => {
  const node = factory.createVariableStatement(undefined, params.declarationList);
  return node;
};

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
