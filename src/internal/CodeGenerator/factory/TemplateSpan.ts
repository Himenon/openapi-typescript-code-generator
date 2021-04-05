import ts from "typescript";

export interface Params {
  expression: ts.Expression;
  literal: ts.TemplateMiddle | ts.TemplateTail;
}

export interface Factory {
  create: (params: Params) => ts.TemplateSpan;
}

export const create = ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] => (params: Params): ts.TemplateSpan => {
  const node = factory.createTemplateSpan(params.expression, params.literal);
  return node;
};

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
