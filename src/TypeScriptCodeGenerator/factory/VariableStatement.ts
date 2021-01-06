import ts from "typescript";

export interface Params {
  declarationList: ts.VariableDeclarationList | ts.VariableDeclaration[];
}

export interface Factory {
  create: (params: Params) => ts.VariableStatement;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params): ts.VariableStatement => {
  const node = factory.createVariableStatement(undefined, params.declarationList);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
