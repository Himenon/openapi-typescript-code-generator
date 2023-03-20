import ts from "typescript";

export interface Params$Create {
  name: string;
}

export interface Factory {
  create: (params: Params$Create) => ts.ShorthandPropertyAssignment;
}

export const create =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] =>
  (params: Params$Create): ts.ShorthandPropertyAssignment => {
    const node = factory.createShorthandPropertyAssignment(params.name, undefined);
    return node;
  };

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
