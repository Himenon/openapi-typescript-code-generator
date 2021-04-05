import ts from "typescript";

import type { TsGenerator } from "../../api";
import type { CodeGenerator } from "../../types";

/**
 * export type RequestContentType${operationId} = keyof RequestBody${operationId};
 */
export const createRequestContentTypeReference = (factory: TsGenerator.Factory.Type, params: CodeGenerator.Params) => {
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: params.requestContentTypeName,
    type: factory.TypeOperatorNode.create({
      syntaxKind: "keyof",
      type: factory.TypeReferenceNode.create({
        name: params.requestBodyName,
      }),
    }),
  });
};
/**
 * export type ResponseContentType${operationId} = keyof Response${operationId}$Status$200;
 * export type ResponseContentType${operationId} = keyof Response${operationId}$Status$200 | keyof Response${operationId}$Status$203;
 */
export const createResponseContentTypeReference = (factory: TsGenerator.Factory.Type, params: CodeGenerator.Params) => {
  if (params.has2OrMoreSuccessResponseContentTypes) {
    return factory.TypeAliasDeclaration.create({
      export: true,
      name: params.responseContentTypeName,
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
    name: params.responseContentTypeName,
    type: factory.TypeOperatorNode.create({
      syntaxKind: "keyof",
      type: factory.TypeReferenceNode.create({
        name: params.responseSuccessNames[0],
      }),
    }),
  });
};

const createHeaders = (factory: TsGenerator.Factory.Type, params: CodeGenerator.Params) => {
  const members = [];

  if (params.has2OrMoreRequestContentTypes) {
    members.push(
      factory.PropertySignature.create({
        name: `"Content-Type"`,
        optional: false,
        type: factory.TypeReferenceNode.create({ name: "T" }),
      }),
    );
  }

  if (params.has2OrMoreSuccessResponseContentTypes) {
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
export const create = (factory: TsGenerator.Factory.Type, params: CodeGenerator.Params): ts.InterfaceDeclaration | undefined => {
  const typeParameters: ts.TypeParameterDeclaration[] = [];
  const members: ts.TypeElement[] = [];
  if (params.hasRequestBody && params.has2OrMoreRequestContentTypes) {
    typeParameters.push(
      factory.TypeParameterDeclaration.create({
        name: "T",
        constraint: factory.TypeReferenceNode.create({
          name: params.requestContentTypeName,
        }),
      }),
    );
  }

  if (params.has2OrMoreSuccessResponseContentTypes) {
    typeParameters.push(
      factory.TypeParameterDeclaration.create({
        name: "U",
        constraint: factory.TypeReferenceNode.create({
          name: params.responseContentTypeName,
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
        name: params.parameterName,
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
          name: params.requestBodyName,
        }),
        indexType: factory.TypeReferenceNode.create({
          name: params.requestFirstContentType ? `"${params.requestFirstContentType}"` : "T",
        }),
      }),
    });
    members.push(requestBody);
  }

  if (members.length === 0) {
    return;
  }

  return factory.InterfaceDeclaration.create({
    export: true,
    name: params.argumentParamsTypeDeclaration,
    members,
    typeParameters,
  });
};
