import ts from "typescript";

export interface Params {
  head: ts.TemplateHead;
  templateSpans: readonly ts.TemplateSpan[];
}

export interface Factory {
  create: (params: Params) => ts.TemplateExpression;
}

export const create = ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] => (params: Params): ts.TemplateExpression => {
  const node = factory.createTemplateExpression(params.head, params.templateSpans);
  return node;
};

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
