import ts from "typescript";

import { Factory } from "../../../../CodeGenerator";
import * as Name from "../../Name";
import * as MethodBody from "./MethodBody";
import * as Types from "./types";

export type MethodBodyParams = Types.MethodBodyParams;
export { MethodBody };

const generateParams = (factory: Factory.Type, params: Types.MethodParams) => {
  const typeArguments: ts.TypeNode[] = [];
  if (params.hasOver2RequestContentTypes) {
    typeArguments.push(
      factory.TypeReferenceNode.create({
        name: "RequestContentType",
      }),
    );
  }
  if (params.hasOver2SuccessResponseContentTypes) {
    typeArguments.push(
      factory.TypeReferenceNode.create({
        name: "ResponseContentType",
      }),
    );
  }
  return factory.ParameterDeclaration.create({
    name: "params",
    modifiers: undefined,
    type: factory.TypeReferenceNode.create({
      name: params.argumentParamsTypeDeclaration,
      typeArguments,
    }),
  });
};

const generateResponseReturnType = (factory: Factory.Type, successResponseNameList: string[], successResponseContentTypeList: string[]) => {
  let objectType: ts.TypeNode = factory.TypeNode.create({
    type: "void",
  });
  if (successResponseNameList.length === 1) {
    objectType = factory.TypeReferenceNode.create({
      name: successResponseNameList[0],
    });
  } else if (successResponseNameList.length > 1) {
    objectType = factory.UnionTypeNode.create({
      typeNodes: successResponseNameList.map(item => factory.TypeReferenceNode.create({ name: item })),
    });
  }

  // レスすポンスが存在しないので Promise<void>
  if (successResponseNameList.length === 0) {
    return factory.TypeReferenceNode.create({
      name: "Promise",
      typeArguments: [objectType],
    });
  }

  const isOnlyOneResponseContentType = successResponseContentTypeList.length === 1;
  let indexType: ts.TypeNode = factory.TypeReferenceNode.create({
    name: "ResponseContentType",
  });
  if (isOnlyOneResponseContentType) {
    indexType = factory.TypeReferenceNode.create({
      name: `"${successResponseContentTypeList[0]}"`,
    });
  }

  return factory.TypeReferenceNode.create({
    name: "Promise",
    typeArguments: [
      factory.IndexedAccessTypeNode.create({
        objectType,
        indexType,
      }),
    ],
  });
};

const methodTypeParameters = (factory: Factory.Type, params: Types.MethodParams): ts.TypeParameterDeclaration[] => {
  const typeParameters: ts.TypeParameterDeclaration[] = [];
  if (params.requestContentTypes.length > 1) {
    typeParameters.push(
      factory.TypeParameterDeclaration.create({
        name: "RequestContentType",
        constraint: factory.TypeReferenceNode.create({
          name: Name.requestContentType(params.operationId),
        }),
      }),
    );
  }
  if (params.responseSuccessContentTypes.length > 1) {
    typeParameters.push(
      factory.TypeParameterDeclaration.create({
        name: "ResponseContentType",
        constraint: factory.TypeReferenceNode.create({
          name: Name.responseContentType(params.operationId),
        }),
      }),
    );
  }
  return typeParameters;
};

/**
 *
 * public async {functionName}(params: {argumentParamsTypeDeclaration}<{RequestContentType}>): Promise<{requestBodyName}[ResponseContentType]> {
 *
 * }
 */
export const create = (factory: Factory.Type, params: Types.MethodParams): ts.MethodDeclaration => {
  const typeParameters: ts.TypeParameterDeclaration[] = methodTypeParameters(factory, params);
  const methodArguments: ts.ParameterDeclaration[] = [];
  const hasParamsArguments =
    params.hasParameter || params.hasRequestBody || params.hasOver2SuccessResponseContentTypes || params.hasOver2RequestContentTypes;

  if (hasParamsArguments) {
    methodArguments.push(generateParams(factory, params));
  }

  const returnType: ts.TypeNode = generateResponseReturnType(factory, params.responseSuccessNames, params.responseSuccessContentTypes);

  methodArguments.push(
    factory.ParameterDeclaration.create({
      name: "option",
      modifiers: undefined,
      optional: true,
      type: factory.TypeReferenceNode.create({
        name: "RequestOption",
      }),
    }),
  );

  return factory.MethodDeclaration.create({
    name: params.functionName,
    async: true,
    parameters: methodArguments,
    comment: params.comment,
    deprecated: params.deprecated,
    type: returnType,
    typeParameters: typeParameters,
    body: factory.Block.create({
      statements: MethodBody.create(factory, params),
      multiLine: true,
    }),
  });
};
