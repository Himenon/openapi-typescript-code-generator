import * as ts from "typescript";

export interface Params {
  value: string | boolean;
}

export type Factory = (params: Params) => ts.LiteralTypeNode;

export const create = ({ factory }: ts.TransformationContext): Factory => (params: Params): ts.LiteralTypeNode => {
  if (typeof params.value === "string") {
    return factory.createLiteralTypeNode(factory.createStringLiteral(params.value));
  }
  return factory.createLiteralTypeNode(params.value ? factory.createTrue() : factory.createFalse());
};
