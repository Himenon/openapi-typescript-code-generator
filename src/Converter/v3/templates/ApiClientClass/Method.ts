import ts from "typescript";

import { Factory } from "../../../../TypeScriptCodeGenerator";

export interface Params {
  name: string;
  parameterName?: string;
  requestBodyName?: string;
}

/**
 *
 * public async {name}<C extends {requestBodyName}>(params: {parameterName}): Promise<{requestBodyName}[C]> {
 *
 * }
 */
export const create = (factory: Factory.Type, { name, parameterName, requestBodyName }: Params): ts.MethodDeclaration => {
  const genericsIdentifier = "C";
  const parameters: ts.ParameterDeclaration[] = [];
  if (parameterName) {
    parameters.push(
      factory.ParameterDeclaration.create({
        name: "params",
        modifiers: undefined,
        type: factory.TypeReferenceNode.create({
          name: parameterName,
        }),
      }),
    );
  } else {
    parameters.push(
      factory.ParameterDeclaration.create({
        name: "params",
        modifiers: undefined,
        type: factory.TypeNode.create({
          type: "object",
          value: [],
        }),
      }),
    );
  }

  const typeParameters: ts.TypeParameterDeclaration[] = [];
  let returnType: ts.TypeNode = factory.TypeReferenceNode.create({
    name: "Promise",
    typeArguments: [
      factory.TypeNode.create({
        type: "void",
      }),
    ],
  });
  if (requestBodyName) {
    typeParameters.push(
      factory.TypeParameterDeclaration.create({
        name: genericsIdentifier,
        constraint: factory.TypeOperatorNode.create({
          syntaxKind: "keyof",
          type: factory.TypeReferenceNode.create({
            name: requestBodyName,
          }),
        }),
      }),
    );
    returnType = factory.TypeReferenceNode.create({
      name: "Promise",
      typeArguments: [
        factory.IndexedAccessTypeNode.create({
          objectType: factory.TypeReferenceNode.create({
            name: requestBodyName,
          }),
          indexType: factory.TypeReferenceNode.create({
            name: genericsIdentifier,
          }),
        }),
      ],
    });
  }

  return factory.MethodDeclaration.create({
    name: name,
    parameters: parameters,
    type: returnType,
    typeParameters: typeParameters,
    body: factory.Block.create({
      statements: [factory.ReturnStatement.create({})],
      multiLine: true,
    }),
  });
};
