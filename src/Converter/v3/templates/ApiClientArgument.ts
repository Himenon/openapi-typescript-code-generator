import ts from "typescript";

import { Factory } from "../../../TypeScriptCodeGenerator";
import * as Name from "../Name";

export interface Params {
  name: string;
  operationId: string;
  hasParameter: boolean;
  hasRequestBody: boolean;
}

// export type RequestContentType${operationId} = keyof RequestBody${operationId};
// export type ResponseContentType${operationId} = keyof Response${operationId}$Status$...;

export const createRequestContentTypeReference = (factory: Factory.Type, operationId: string) => {
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: Name.requestContentType(operationId),
    type: factory.TypeOperatorNode.create({
      syntaxKind: "keyof",
      type: factory.TypeReferenceNode.create({
        name: Name.requestBodyName(operationId),
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
export const create = (factory: Factory.Type, { name, operationId, hasParameter, hasRequestBody }: Params): ts.InterfaceDeclaration => {
  const typeParameters: ts.TypeParameterDeclaration[] = [];
  const members: ts.TypeElement[] = [];
  const genericsName = "T";
  if (hasRequestBody) {
    typeParameters.push(
      factory.TypeParameterDeclaration.create({
        name: genericsName,
        constraint: factory.TypeReferenceNode.create({
          name: Name.requestContentType(operationId),
        }),
      }),
    );
  }

  if (hasParameter) {
    const parameter = factory.PropertySignature.create({
      name: "parameter",
      optional: false,
      type: factory.TypeReferenceNode.create({
        name: Name.parameterName(operationId),
      }),
    });
    members.push(parameter);
  }

  if (hasRequestBody) {
    const requestBody = factory.PropertySignature.create({
      name: "requestBody",
      optional: false,
      type: factory.IndexedAccessTypeNode.create({
        objectType: factory.TypeReferenceNode.create({
          name: Name.requestBodyName(operationId),
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
