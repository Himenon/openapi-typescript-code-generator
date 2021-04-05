import ts from "typescript";

const flags = {
  const: ts.NodeFlags.Const,
} as const;

export interface Params {
  declarations: readonly ts.VariableDeclaration[];
  flag: keyof typeof flags;
}

export interface Factory {
  create: (params: Params) => ts.VariableDeclarationList;
}

export const create = ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] => (params: Params): ts.VariableDeclarationList => {
  const node = factory.createVariableDeclarationList(params.declarations, flags[params.flag]);
  return node;
};

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
