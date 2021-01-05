import ts from "typescript";

import { Factory } from "../../../TypeScriptCodeGenerator";

/**
 * export class Client<ApiClient> {
 *   constructor(private apiClient: ApiClient, private baseUrl: string) {}
 * }
 */
export const createApiClientClass = (factory: Factory.Type, members: ts.ClassElement[]) => {
  return factory.ClassDeclaration.create({
    name: "Client",
    export: true,
    members,
    typeParameterDeclaration: [
      factory.TypeParameterDeclaration.create({
        name: "ApiClient",
      }),
    ],
  });
};

/**
 * constructor(private apiClient: ApiClient, private baseUrl: string) { }
 */
const createApiClientConstructor = (factory: Factory.Type): ts.ConstructorDeclaration => {
  const parameter1 = factory.ParameterDeclaration.create({
    modifiers: "private",
    name: "apiClient",
    type: factory.TypeReferenceNode.create({
      name: "ApiClient",
    }),
  });
  const parameter2 = factory.ParameterDeclaration.create({
    modifiers: "private",
    name: "baseUrl",
    type: factory.TypeNode.create({
      type: "string",
    }),
  });
  return factory.ConstructorDeclaration.create({
    parameters: [parameter1, parameter2],
    body: factory.Block.create({
      statements: [],
      multiLine: false,
    }),
  });
};

export interface MethodParam {
  methodName: string;
  paramsTypeName?: string;
  responseTypeName?: string;
}

/**
 *
 * public {methodName} (params: {paramsTypeName}): Promise<{responseTypeName}> {
 *
 * }
 */
const createMethod = (factory: Factory.Type, params: MethodParam): ts.MethodDeclaration => {
  const parameters: ts.ParameterDeclaration[] = [];
  if (params.paramsTypeName) {
    parameters.push(
      factory.ParameterDeclaration.create({
        name: "params",
        modifiers: undefined,
        type: factory.TypeReferenceNode.create({
          name: params.paramsTypeName,
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
  if (params.responseTypeName) {
    typeParameters.push(
      factory.TypeParameterDeclaration.create({
        name: "C",
        constraint: factory.TypeOperatorNode.create({
          syntaxKind: "keyof",
          type: factory.TypeReferenceNode.create({
            name: params.responseTypeName,
          }),
        }),
      }),
    );
    returnType = factory.TypeReferenceNode.create({
      name: "Promise",
      typeArguments: [
        factory.IndexedAccessTypeNode.create({
          objectType: factory.TypeReferenceNode.create({
            name: params.responseTypeName,
          }),
          indexType: factory.TypeReferenceNode.create({
            name: "C",
          }),
        }),
      ],
    });
  }

  return factory.MethodDeclaration.create({
    name: params.methodName,
    parameters: parameters,
    type: returnType,
    typeParameters: typeParameters,
    body: factory.Block.create({
      statements: [factory.ReturnStatement.create({})],
      multiLine: true,
    }),
  });
};

export const createApiClientCode = (factory: Factory.Type, methodParams: MethodParam[]): ts.ClassDeclaration => {
  const members = methodParams.map(params => createMethod(factory, params));
  return createApiClientClass(factory, [createApiClientConstructor(factory), ...members]);
};
