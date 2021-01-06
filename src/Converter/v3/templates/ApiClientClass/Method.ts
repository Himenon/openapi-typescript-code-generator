import ts from "typescript";

import { Factory } from "../../../../TypeScriptCodeGenerator";
import * as MethodBody from "./MethodBody";

export { MethodBody };

export interface Params {
  httpMethod: string;
  requestUri: string;
  name: string;
  parameterName?: string;
  responseNames?: string[];
  requestParameterCategories: MethodBody.Param[];
}

/**
 *
 * public async {name}<C extends {requestBodyName}>(params: {parameterName}): Promise<{requestBodyName}[C]> {
 *
 * }
 */
export const create = (
  factory: Factory.Type,
  { name, httpMethod, requestUri, parameterName, responseNames, requestParameterCategories }: Params,
): ts.MethodDeclaration => {
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
  if (responseNames && responseNames.length > 0) {
    const isOne = responseNames.length === 1;
    const typeNodes = responseNames.map(responseName =>
      factory.TypeReferenceNode.create({
        name: responseName,
      }),
    );
    typeParameters.push(
      factory.TypeParameterDeclaration.create({
        name: genericsIdentifier,
        constraint: factory.TypeOperatorNode.create({
          syntaxKind: "keyof",
          type: isOne
            ? typeNodes[0]
            : factory.UnionTypeNode.create({
                typeNodes: typeNodes,
              }),
        }),
      }),
    );
    returnType = factory.TypeReferenceNode.create({
      name: "Promise",
      typeArguments: [
        factory.IndexedAccessTypeNode.create({
          objectType: isOne
            ? typeNodes[0]
            : factory.UnionTypeNode.create({
                typeNodes: typeNodes,
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
    async: true,
    parameters: parameters,
    type: returnType,
    typeParameters: typeParameters,
    body: factory.Block.create({
      statements: MethodBody.create(factory, httpMethod, requestUri, requestParameterCategories),
      multiLine: true,
    }),
  });
};
