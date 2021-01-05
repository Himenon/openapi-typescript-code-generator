import ts from "typescript";

import { Factory } from "../../../TypeScriptCodeGenerator";

/**
 * Function Template
 *
export interface {name}<T extends keyof {requestBodyName}> {
  contentType: T;
  parameter: {parameterName};
  requestBody: {requestBodyName}[T];
}
 */
export const generateFunctionArgumentInterface = (
  factory: Factory.Type,
  name: string,
  parameterName?: string,
  requestBodyName?: string,
): ts.InterfaceDeclaration => {
  const typeParameters: ts.TypeParameterDeclaration[] = [];
  const members: ts.TypeElement[] = [];
  const genericsName = "T";
  if (requestBodyName) {
    typeParameters.push(
      factory.TypeParameterDeclaration.create({
        name: genericsName,
        constraint: factory.TypeOperatorNode.create({
          syntaxKind: "keyof",
          type: factory.TypeReferenceNode.create({
            name: requestBodyName,
          }),
        }),
      }),
    );
  }

  if (parameterName) {
    const parameter = factory.PropertySignature.create({
      name: "parameter",
      optional: false,
      type: factory.TypeReferenceNode.create({
        name: parameterName,
      }),
    });
    members.push(parameter);
  }

  if (requestBodyName) {
    const contentType = factory.PropertySignature.create({
      name: "contentType",
      optional: false,
      type: factory.TypeReferenceNode.create({
        name: "T",
      }),
    });
    members.push(contentType);

    const requestBody = factory.PropertySignature.create({
      name: "requestBody",
      optional: false,
      type: factory.IndexedAccessTypeNode.create({
        objectType: factory.TypeReferenceNode.create({
          name: requestBodyName,
        }),
        indexType: factory.TypeReferenceNode.create({
          name: genericsName,
        }),
      }),
    });
    members.push(requestBody);
  }

  return factory.InterfaceDeclaration.create({
    export: true,
    name,
    members,
    typeParameters,
  });
};

export const generateRequestTypes = (
  factory: Factory.Type,
  operationId: string,
  parameterTypeName?: string,
  requestBodyTypeName?: string,
  description?: string,
): ts.InterfaceDeclaration => {
  return factory.InterfaceDeclaration.create({
    export: true,
    name: `Params$${operationId}`,
    members: [
      parameterTypeName &&
        factory.PropertySignature.create({
          name: "parameter",
          optional: false,
          type: factory.TypeReferenceNode.create({
            name: parameterTypeName,
          }),
        }),
      requestBodyTypeName &&
        factory.PropertySignature.create({
          name: "requestBody",
          optional: false,
          type: factory.TypeReferenceNode.create({
            name: requestBodyTypeName,
          }),
        }),
    ].filter(Boolean) as ts.PropertySignature[],
    comment: description,
  });
};

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
  const typeArgument0 =
    params.responseTypeName &&
    factory.TypeParameterDeclaration.create({
      name: "C",
      constraint: factory.TypeOperatorNode.create({
        syntaxKind: "keyof",
        type: factory.TypeReferenceNode.create({
          name: params.responseTypeName,
        }),
      }),
    });
  const parameter0 = factory.ParameterDeclaration.create({
    name: "params",
    modifiers: undefined,
    type: params.paramsTypeName
      ? factory.TypeReferenceNode.create({
          name: params.paramsTypeName,
        })
      : factory.TypeNode.create({
          type: "object",
          value: [],
        }),
  });

  const returnType = factory.TypeReferenceNode.create({
    name: "Promise",
    typeArguments: [
      params.responseTypeName
        ? factory.IndexedAccessTypeNode.create({
            objectType: factory.TypeReferenceNode.create({
              name: params.responseTypeName,
            }),
            indexType: factory.TypeReferenceNode.create({
              name: "C",
            }),
          })
        : factory.TypeNode.create({
            type: "void",
          }),
    ],
  });

  return factory.MethodDeclaration.create({
    name: params.methodName,
    parameters: [parameter0],
    type: returnType,
    typeParameters: typeArgument0 ? [typeArgument0] : [],
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
