import ts from "typescript";

export interface Params {
  modifiers?: ts.Modifier[];
  declarationList: ts.VariableDeclarationList | ts.VariableDeclaration[];
}

export interface Factory {
  create: (params: Params) => ts.VariableStatement;
}

export const create =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] =>
  (params: Params): ts.VariableStatement => {
    const node = factory.createVariableStatement(params.modifiers, params.declarationList);
    return node;
  };

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
