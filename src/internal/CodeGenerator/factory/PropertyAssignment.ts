import ts from "typescript";

export interface Params {
  name: string;
  initializer: ts.Expression;
}

export interface Factory {
  create: (params: Params) => ts.PropertyAssignment;
}

export const create = ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] => (params: Params): ts.PropertyAssignment => {
  const node = factory.createPropertyAssignment(params.name, params.initializer);
  return node;
};

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
