import * as ts from "typescript";

export interface Params {
  export?: true;
  name: string;
  members: readonly ts.TypeElement[];
}

export const create = ({ factory }: ts.TransformationContext) => (params: Params): ts.InterfaceDeclaration => {
  return factory.createInterfaceDeclaration(
    undefined,
    params.export && [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(params.name),
    undefined,
    undefined,
    params.members,
  );
};
