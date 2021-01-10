import ts from "typescript";

export interface Params {
  properties: ts.ObjectLiteralElementLike[];
  multiLine?: boolean;
}

export interface Factory {
  create: (params: Params) => ts.ObjectLiteralExpression;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params): ts.ObjectLiteralExpression => {
  const node = factory.createObjectLiteralExpression(params.properties, params.multiLine);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
