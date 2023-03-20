import ts from "typescript";
import { generateComment } from "./utils";

export interface Params {
  name: string | ts.BindingName;
  type?: ts.TypeNode;
  initializer?: ts.Expression;
}

export interface Factory {
  create: (params: Params) => ts.VariableDeclaration;
}

export const create =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] =>
  (params: Params): ts.VariableDeclaration => {
    const node = factory.createVariableDeclaration(params.name, undefined, params.type, params.initializer);
    return node;
  };

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
