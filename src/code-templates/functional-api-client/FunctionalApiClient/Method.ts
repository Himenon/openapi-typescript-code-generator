import { EOL } from "os";
import ts from "typescript";

import type { TsGenerator } from "../../../api";
import type { CodeGenerator } from "../../../types";
import type { Option } from "../../_shared/types";
import * as MethodBody from "../../_shared/MethodBody";

export { MethodBody };

const generateParams = (factory: TsGenerator.Factory.Type, { convertedParams }: CodeGenerator.Params) => {
  const typeArguments: ts.TypeNode[] = [];
  if (convertedParams.has2OrMoreRequestContentTypes) {
    typeArguments.push(
      factory.TypeReferenceNode.create({
        name: "RequestContentType",
      }),
    );
  }
  if (convertedParams.has2OrMoreSuccessResponseContentTypes) {
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
      name: convertedParams.argumentParamsTypeDeclaration,
      typeArguments,
    }),
  });
};

const generateResponseReturnType = (
  factory: TsGenerator.Factory.Type,
  successResponseNameList: string[],
  successResponseContentTypeList: string[],
  option: Option,
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

const methodTypeParameters = (factory: TsGenerator.Factory.Type, { convertedParams }: CodeGenerator.Params): ts.TypeParameterDeclaration[] => {
  const typeParameters: ts.TypeParameterDeclaration[] = [];
  if (convertedParams.has2OrMoreRequestContentTypes) {
    typeParameters.push(
      factory.TypeParameterDeclaration.create({
        name: "RequestContentType",
        constraint: factory.TypeReferenceNode.create({
          name: convertedParams.requestContentTypeName,
        }),
      }),
    );
  }
  if (convertedParams.has2OrMoreSuccessResponseContentTypes) {
    typeParameters.push(
      factory.TypeParameterDeclaration.create({
        name: "ResponseContentType",
        constraint: factory.TypeReferenceNode.create({
          name: convertedParams.responseContentTypeName,
        }),
      }),
    );
  }
  return typeParameters;
};

/**
 * const {functionName} = async (params: {argumentParamsTypeDeclaration}<{RequestContentType}>): Promise<{requestBodyName}[ResponseContentType]> => {
 *
 * }
 */
export const create = (factory: TsGenerator.Factory.Type, params: CodeGenerator.Params, option: Option): ts.VariableStatement => {
  const { convertedParams } = params;
  const typeParameters: ts.TypeParameterDeclaration[] = methodTypeParameters(factory, params);
  const methodArguments: ts.ParameterDeclaration[] = [];
  const hasParamsArguments =
    convertedParams.hasParameter ||
    convertedParams.hasRequestBody ||
    convertedParams.has2OrMoreSuccessResponseContentTypes ||
    convertedParams.has2OrMoreRequestContentTypes;

  if (hasParamsArguments) {
    methodArguments.push(generateParams(factory, params));
  }

  const returnType: ts.TypeNode = generateResponseReturnType(
    factory,
    convertedParams.responseSuccessNames,
    convertedParams.successResponseContentTypes,
    option,
  );

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

  const arrowFunction = factory.ArrowFunction.create({
    typeParameters: typeParameters,
    parameters: methodArguments,
    type: returnType,
    body: factory.Block.create({
      statements: MethodBody.create(factory, params, "function"),
      multiLine: true,
    }),
  });

  const variableDeclarationList = factory.VariableDeclarationList.create({
    declarations: [
      factory.VariableDeclaration.create({
        name: convertedParams.functionName,
        initializer: arrowFunction,

      }),
    ],
    flag: "const",
    comment: option.additionalMethodComment
    ? [params.operationParams.comment, `operationId: ${params.operationId}`, `Request URI: ${params.operationParams.requestUri}`]
        .filter(t => !!t)
        .join(EOL)
    : params.operationParams.comment,
  deprecated: params.operationParams.deprecated,
  });

  return factory.VariableStatement.create({
    declarationList: variableDeclarationList,
  });
};
