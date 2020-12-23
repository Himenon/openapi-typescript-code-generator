import * as ts from "typescript";

export interface Params {
  name: string;
  optional?: true;
  type: ts.TypeNode;
}

export type Factory = (params: Params) => ts.PropertySignature;

export const create = ({ factory }: ts.TransformationContext): Factory => (params: Params): ts.PropertySignature => {
  return factory.createPropertySignature(
    undefined,
    factory.createIdentifier(params.name),
    params.optional && factory.createToken(ts.SyntaxKind.QuestionToken),
    params.type,
  );
};
