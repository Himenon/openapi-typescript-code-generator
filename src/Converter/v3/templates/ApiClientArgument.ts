import ts from "typescript";

import { Factory } from "../../../TypeScriptCodeGenerator";

export interface Params {
  name: string;
  operationId: string;
  parameterName?: string;
  requestBodyName?: string;
}

export interface Params2 {
  operationId: string;
  requestBodyName: string;
}

// export type RequestContentType${operationId} = keyof RequestBody${operationId};
// export type ResponseContentType${operationId} = keyof Response${operationId}$Status$...;

export const createRequestContentTypeReference = (factory: Factory.Type, { operationId, requestBodyName }: Params2) => {
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: `RequestContentType$${operationId}`,
    type: factory.TypeOperatorNode.create({
      syntaxKind: "keyof",
      type: factory.TypeReferenceNode.create({
        name: requestBodyName,
      }),
    }),
  });
};

/**
 * Function Template
 *
 * export interface {name}<T extends keyof {requestBodyName}> {
 *   contentType: T;
 *   parameter: {parameterName};
 *   requestBody: {requestBodyName}[T];
 * }
 */
export const create = (factory: Factory.Type, { name, parameterName, requestBodyName, operationId }: Params): ts.InterfaceDeclaration => {
  const typeParameters: ts.TypeParameterDeclaration[] = [];
  const members: ts.TypeElement[] = [];
  const genericsName = "T";
  if (requestBodyName) {
    typeParameters.push(
      factory.TypeParameterDeclaration.create({
        name: genericsName,
        constraint: factory.TypeReferenceNode.create({
          name: `RequestContentType$${operationId}`,
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
