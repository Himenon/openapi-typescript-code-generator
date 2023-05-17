import ts from "typescript";

export interface UpdateParams {
  node: ts.ModuleBlock;
  statements: ts.Statement[];
}

export interface Factory {
  update: (params: UpdateParams) => ts.ModuleBlock;
}

export const update =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["update"] =>
  (params: UpdateParams): ts.ModuleBlock => {
    const { node, statements } = params;
    return factory.updateModuleBlock(node, statements);
  };

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    update: update(context),
  };
};
