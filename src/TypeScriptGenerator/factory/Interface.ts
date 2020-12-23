import * as ts from "typescript";

export interface Params {
  export: boolean;
  name: string;
  members: readonly ts.TypeElement[];
}

export const generate = ({ factory }: ts.TransformationContext, params: Params): ts.InterfaceDeclaration => {
  return factory.createInterfaceDeclaration(
    undefined,
    params.export ? [factory.createModifier(ts.SyntaxKind.ExportKeyword)] : undefined,
    factory.createIdentifier(params.name),
    undefined,
    undefined,
    params.members,
  );
};
