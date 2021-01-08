import ts from "typescript";

export interface Params {
  name: string;
  initializer: ts.Expression;
}

export interface Factory {
  create: (params: Params) => ts.PropertyAssignment;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params): ts.PropertyAssignment => {
  const node = factory.createPropertyAssignment(params.name, params.initializer);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
