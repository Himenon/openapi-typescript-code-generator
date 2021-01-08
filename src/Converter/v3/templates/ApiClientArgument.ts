import ts from "typescript";

import { Factory } from "../../../TypeScriptCodeGenerator";
import * as Name from "../Name";
import * as Types from "./ApiClientClass/types";

/**
 * export type RequestContentType${operationId} = keyof RequestBody${operationId};
 */
export const createRequestContentTypeReference = (factory: Factory.Type, { operationId }: Types.MethodParams) => {
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
 * export type ResponseContentType${operationId} = keyof Response${operationId}$Status$200;
 * export type ResponseContentType${operationId} = keyof Response${operationId}$Status$200 | keyof Response${operationId}$Status$203;
 */
export const createResponseContentTypeReference = (factory: Factory.Type, params: Types.MethodParams) => {
  if (params.hasOver2SuccessResponseContentTypes) {
    return factory.TypeAliasDeclaration.create({
      export: true,
      name: Name.responseContentType(params.operationId),
      type: factory.UnionTypeNode.create({
        typeNodes: params.responseSuccessNames.map(item => {
          return factory.TypeOperatorNode.create({
            syntaxKind: "keyof",
            type: factory.TypeReferenceNode.create({
              name: item,
            }),
          });
        }),
      }),
    });
  }
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: Name.responseContentType(params.operationId),
    type: factory.TypeOperatorNode.create({
      syntaxKind: "keyof",
      type: factory.TypeReferenceNode.create({
        name: params.responseSuccessNames[0],
      }),
    }),
  });
};

const createHeaders = (factory: Factory.Type, params: Types.MethodParams) => {
  const members = [];

  if (params.hasOver2RequestContentTypes) {
    members.push(
      factory.PropertySignature.create({
        name: `"Content-Type"`,
        optional: false,
        type: factory.TypeReferenceNode.create({ name: "T" }),
      }),
    );
  }

  if (params.hasOver2SuccessResponseContentTypes) {
    members.push(
      factory.PropertySignature.create({
        name: `Accept`,
        optional: false,
        type: factory.TypeReferenceNode.create({ name: "U" }),
      }),
    );
  }
  if (members.length === 0) {
    return undefined;
  }

  return factory.TypeLiteralNode.create({ members });
};

/**
 * Function Template
 *
 * export interface {name}<T extends keyof {requestBodyName}> {
 *   parameter: {parameterName};
 *   requestBody: {requestBodyName}[T];
 * }
 */
export const create = (factory: Factory.Type, params: Types.MethodParams): ts.InterfaceDeclaration => {
  const typeParameters: ts.TypeParameterDeclaration[] = [];
  const members: ts.TypeElement[] = [];
  if (params.hasRequestBody && params.hasOver2RequestContentTypes) {
    typeParameters.push(
      factory.TypeParameterDeclaration.create({
        name: "T",
        constraint: factory.TypeReferenceNode.create({
          name: Name.requestContentType(params.operationId),
        }),
      }),
    );
  }

  if (params.hasOver2SuccessResponseContentTypes) {
    typeParameters.push(
      factory.TypeParameterDeclaration.create({
        name: "U",
        constraint: factory.TypeReferenceNode.create({
          name: Name.responseContentType(params.operationId),
        }),
      }),
    );
  }

  const headerDeclaration = createHeaders(factory, params);
  if (headerDeclaration) {
    const extraHeader = factory.PropertySignature.create({
      name: "headers",
      optional: false,
      type: headerDeclaration,
    });
    members.push(extraHeader);
  }

  if (params.hasParameter) {
    const parameter = factory.PropertySignature.create({
      name: "parameter",
      optional: false,
      type: factory.TypeReferenceNode.create({
        name: Name.parameterName(params.operationId),
      }),
    });
    members.push(parameter);
  }

  if (params.hasRequestBody) {
    const requestBody = factory.PropertySignature.create({
      name: "requestBody",
      optional: false,
      type: factory.IndexedAccessTypeNode.create({
        objectType: factory.TypeReferenceNode.create({
          name: Name.requestBodyName(params.operationId),
        }),
        indexType: factory.TypeReferenceNode.create({
          name: params.requestFirstContentType ? `"${params.requestFirstContentType}"` : "T",
        }),
      }),
    });
    members.push(requestBody);
  }

  return factory.InterfaceDeclaration.create({
    export: true,
    name: params.argumentParamsTypeDeclaration,
    members,
    typeParameters,
  });
};
