import ts from "typescript";

import { Factory } from "../../CodeGenerator";
import type { CodeGenerator } from "../../types";
import type { CodeGeneratorParams } from "../../types/extractSchema";
import * as MethodBody from "./MethodBody";

export { MethodBody };

const generateParams = (factory: Factory.Type, params: CodeGeneratorParams) => {
  const typeArguments: ts.TypeNode[] = [];
  if (params.has2OrMoreRequestContentTypes) {
    typeArguments.push(
      factory.TypeReferenceNode.create({
        name: "RequestContentType",
      }),
    );
  }
  if (params.has2OrMoreSuccessResponseContentTypes) {
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

const generateResponseReturnType = (
  factory: Factory.Type,
  successResponseNameList: string[],
  successResponseContentTypeList: string[],
  option: { sync?: boolean },
) => {
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

  // レスポンスが存在しないので Promise<void>
  if (successResponseNameList.length === 0) {
    if (option.sync) {
      return objectType;
    }
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

  if (option.sync) {
    return factory.IndexedAccessTypeNode.create({
      objectType,
      indexType,
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

const methodTypeParameters = (factory: Factory.Type, params: CodeGeneratorParams): ts.TypeParameterDeclaration[] => {
  const typeParameters: ts.TypeParameterDeclaration[] = [];
  if (params.has2OrMoreRequestContentTypes) {
    typeParameters.push(
      factory.TypeParameterDeclaration.create({
        name: "RequestContentType",
        constraint: factory.TypeReferenceNode.create({
          name: params.requestContentTypeName,
        }),
      }),
    );
  }
  if (params.has2OrMoreSuccessResponseContentTypes) {
    typeParameters.push(
      factory.TypeParameterDeclaration.create({
        name: "ResponseContentType",
        constraint: factory.TypeReferenceNode.create({
          name: params.responseContentTypeName,
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
export const create = (factory: Factory.Type, params: CodeGeneratorParams, option: { sync?: boolean }): ts.MethodDeclaration => {
  const typeParameters: ts.TypeParameterDeclaration[] = methodTypeParameters(factory, params);
  const methodArguments: ts.ParameterDeclaration[] = [];
  const hasParamsArguments =
    params.hasParameter || params.hasRequestBody || params.has2OrMoreSuccessResponseContentTypes || params.has2OrMoreRequestContentTypes;

  if (hasParamsArguments) {
    methodArguments.push(generateParams(factory, params));
  }

  const returnType: ts.TypeNode = generateResponseReturnType(factory, params.responseSuccessNames, params.successResponseContentTypes, option);

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
    async: !option.sync,
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
