import ts from "typescript";

import { Factory } from "../../../TypeScriptCodeGenerator";
import * as Name from "../Name";
import * as Types from "./ApiClientClass/types";

// export type RequestContentType${operationId} = keyof RequestBody${operationId};
// export type ResponseContentType${operationId} = keyof Response${operationId}$Status$...;

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

export const createResponseContentTypeReference = (factory: Factory.Type, params: Types.MethodParams) => {
  if (params.successResponseNameList.length > 1) {
    return factory.TypeAliasDeclaration.create({
      export: true,
      name: Name.responseContentType(params.operationId),
      type: factory.UnionTypeNode.create({
        typeNodes: params.successResponseNameList.map(item => {
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
        name: params.successResponseNameList[0],
      }),
    }),
  });
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
  const genericsName = "T";
  if (params.hasRequestBody) {
    typeParameters.push(
      factory.TypeParameterDeclaration.create({
        name: genericsName,
        constraint: factory.TypeReferenceNode.create({
          name: Name.requestContentType(params.operationId),
        }),
      }),
    );
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
          name: genericsName,
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
