import ts from "typescript";

import { Factory } from "../../../../TypeScriptCodeGenerator";
import * as MethodBody from "./MethodBody";

export { MethodBody };

export interface Params {
  operationId: string;
  httpMethod: string;
  requestUri: string;
  functionName: string;
  argumentParamsTypeDeclaration: string;
  successResponseNameList: string[];
  requestParameterCategories: MethodBody.Param[];
  requestContentTypeList: string[];
  successResponseContentTypeList: string[];
  hasParameter: boolean;
  hasRequestBody: boolean;
}

/**
 * 関数の先頭の引数
 */
// const generateTypeParameters = (factory: Factory.Type) => {
//   const typeParameters: ts.TypeParameterDeclaration[] = [];
//   typeParameters.push(
//     factory.TypeParameterDeclaration.create({
//       name: "C",
//       constraint: factory.TypeOperatorNode.create({
//         syntaxKind: "keyof",
//         type: isOne
//           ? typeNodes[0]
//           : factory.UnionTypeNode.create({
//               typeNodes: typeNodes,
//             }),
//       }),
//     }),
//   );
// }

const generateResponseReturnType = (factory: Factory.Type, successResponseNameList: string[], successResponseContentTypeList: string[]) => {
  console.log({
    successResponseNameList,
    successResponseContentTypeList,
  });
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

  // --------
  const isOnlyOneResponseContentType = successResponseContentTypeList.length === 1;
  let indexType: ts.TypeNode = factory.TypeReferenceNode.create({
    name: "C2",
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

/**
 *
 * public async {functionName}(params: {argumentParamsTypeDeclaration}<{RequestContentType}>): Promise<{requestBodyName}[ResponseContentType]> {
 *
 * }
 */
export const create = (factory: Factory.Type, params: Params): ts.MethodDeclaration => {
  const methodArguments: ts.ParameterDeclaration[] = [];
  const hasParamsArguments = params.hasParameter || params.hasRequestBody;
  if (hasParamsArguments) {
    methodArguments.push(
      factory.ParameterDeclaration.create({
        name: "params",
        modifiers: undefined,
        type: factory.TypeReferenceNode.create({
          name: params.argumentParamsTypeDeclaration,
        }),
      }),
    );
  }

  const returnType: ts.TypeNode = generateResponseReturnType(factory, params.successResponseNameList, params.successResponseContentTypeList);

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
    type: returnType,
    typeParameters: [],
    body: factory.Block.create({
      statements: MethodBody.create(factory, params.httpMethod, params.requestUri, params.requestParameterCategories),
      multiLine: true,
    }),
  });
};
