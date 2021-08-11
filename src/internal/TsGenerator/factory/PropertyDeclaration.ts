import ts from "typescript";

export interface Params {
  decorators?: readonly ts.Decorator[] | undefined;
  modifiers: readonly ts.Modifier[] | undefined;
  name: string | ts.PropertyName;
  questionOrExclamationToken?: ts.QuestionToken | ts.ExclamationToken | undefined;
  type: ts.TypeNode | undefined;
  initializer?: ts.Expression | undefined;
}

export interface Factory {
  create: (params: Params) => ts.PropertyDeclaration;
}

export const create = ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] => (
  params: Params,
): ts.PropertyDeclaration => {
  const node = factory.createPropertyDeclaration(
    params.decorators,
    params.modifiers,
    params.name,
    params.questionOrExclamationToken,
    params.type,
    params.initializer,
  );
  return node;
};

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
