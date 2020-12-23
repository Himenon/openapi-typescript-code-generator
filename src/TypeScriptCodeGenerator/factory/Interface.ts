import * as ts from "typescript";

export interface Params {
  export?: true;
  name: string;
  members: readonly ts.TypeElement[];
}

export type Factory = (params: Params) => ts.InterfaceDeclaration;

export const create = ({ factory }: ts.TransformationContext): Factory => (params: Params): ts.InterfaceDeclaration => {
  return factory.createInterfaceDeclaration(
    undefined,
    params.export && [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(params.name),
    undefined,
    undefined,
    params.members,
  );
};
