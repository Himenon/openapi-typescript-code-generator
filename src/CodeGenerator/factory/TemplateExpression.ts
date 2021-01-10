import ts from "typescript";

export interface Params {
  head: ts.TemplateHead;
  templateSpans: readonly ts.TemplateSpan[];
}

export interface Factory {
  create: (params: Params) => ts.TemplateExpression;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params): ts.TemplateExpression => {
  const node = factory.createTemplateExpression(params.head, params.templateSpans);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
