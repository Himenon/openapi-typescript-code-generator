import ts from "typescript";

export interface Params {
  expression: ts.Expression;
  literal: ts.TemplateMiddle | ts.TemplateTail;
}

export interface Factory {
  create: (params: Params) => ts.TemplateSpan;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params): ts.TemplateSpan => {
  const node = factory.createTemplateSpan(params.expression, params.literal);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
