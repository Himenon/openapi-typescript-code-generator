import ts from "typescript";

import type { Factory } from "../../../factory";
import type { CodeGenerator } from "../../../types";

const httpMethodList: string[] = ["GET", "PUT", "POST", "DELETE", "OPTIONS", "HEAD", "PATCH", "TRACE"];

const createErrorResponsesTypeAlias = (typeName: string, factory: Factory.Type, errorResponseNames: string[]) => {
  if (errorResponseNames.length === 0) {
    return factory.TypeAliasDeclaration.create({
      export: true,
      name: typeName,
      type: ts.factory.createToken(ts.SyntaxKind.VoidKeyword),
    });
  }
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: typeName,
    type: factory.UnionTypeNode.create({
      typeNodes: errorResponseNames.map(name => {
        return factory.TypeReferenceNode.create({
          name,
        });
      }),
    }),
  });
};

const createSuccessResponseTypeAlias = (typeName: string, factory: Factory.Type, successResponseNames: string[]) => {
  if (successResponseNames.length === 0) {
    return factory.TypeAliasDeclaration.create({
      export: true,
      name: typeName,
      type: ts.factory.createToken(ts.SyntaxKind.VoidKeyword),
    });
  }
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: typeName,
    type: factory.UnionTypeNode.create({
      typeNodes: successResponseNames.map(name => {
        return factory.TypeReferenceNode.create({
          name,
        });
      }),
    }),
  });
};

const createHttpMethod = (factory: Factory.Type) => {
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: "HttpMethod",
    type: factory.TypeNode.create({ type: "string", enum: httpMethodList }),
  });
};

const createQueryParamsDeclarations = (factory: Factory.Type) => {
  const queryParameterDeclaration = factory.InterfaceDeclaration.create({
    export: true,
    name: "QueryParameter",
    members: [
      factory.PropertySignature.create({
        name: "value",
        optional: false,
        type: factory.TypeNode.create({ type: "any" }),
      }),
      factory.PropertySignature.create({
        name: "style",
        optional: true,
        type: factory.TypeNode.create({ type: "string", enum: ["form", "spaceDelimited", "pipeDelimited", "deepObject"] }),
      }),
      factory.PropertySignature.create({
        name: "explode",
        optional: false,
        type: factory.TypeNode.create({ type: "boolean" }),
      }),
    ],
  });
  const queryParametersDeclaration = factory.InterfaceDeclaration.create({
    export: true,
    name: "QueryParameters",
    members: [
      factory.IndexSignatureDeclaration.create({
        name: "key",
        type: factory.TypeReferenceNode.create({ name: "QueryParameter" }),
      }),
    ],
  });

  return [queryParameterDeclaration, queryParametersDeclaration];
};

const createObjectLikeInterface = (factory: Factory.Type) => {
  return factory.InterfaceDeclaration.create({
    export: true,
    name: "ObjectLike",
    members: [
      factory.IndexSignatureDeclaration.create({
        name: "key",
        type: factory.TypeNode.create({ type: "any" }),
      }),
    ],
  });
};

export const create = (factory: Factory.Type, list: CodeGenerator.Params[], option: { sync?: boolean }): ts.Statement[] => {
  const objectLikeOrAnyType = factory.UnionTypeNode.create({
    typeNodes: [
      factory.TypeReferenceNode.create({
        name: "ObjectLike",
      }),
      factory.TypeNode.create({
        type: "any",
      }),
    ],
  });

  const httpMethod = factory.ParameterDeclaration.create({
    name: "httpMethod",
    type: factory.TypeReferenceNode.create({
      name: "HttpMethod",
    }),
  });
  const url = factory.ParameterDeclaration.create({
    name: "url",
    type: factory.TypeNode.create({ type: "string" }),
  });
  const headers = factory.ParameterDeclaration.create({
    name: "headers",
    type: objectLikeOrAnyType,
  });
  const requestBody = factory.ParameterDeclaration.create({
    name: "requestBody",
    type: objectLikeOrAnyType,
  });
  const queryParameters = factory.ParameterDeclaration.create({
    name: "queryParameters",
    type: factory.UnionTypeNode.create({
      typeNodes: [
        factory.TypeReferenceNode.create({
          name: "QueryParameters",
        }),
        factory.TypeNode.create({ type: "undefined" }),
      ],
    }),
  });
  const options = factory.ParameterDeclaration.create({
    name: "options",
    optional: true,
    type: factory.TypeReferenceNode.create({
      name: "RequestOption",
    }),
  });

  const successResponseNames = list.map(item => item.responseSuccessNames).flat();

  const errorResponseNamespace = factory.Namespace.create({
    export: true,
    name: "ErrorResponse",
    statements: list.map(item => {
      return createErrorResponsesTypeAlias(`${item.escapedOperationId}`, factory, item.responseErrorNames);
    }),
  });

  const returnType = option.sync
    ? factory.TypeReferenceNode.create({
        name: "T",
      })
    : factory.TypeReferenceNode.create({
        name: "Promise",
        typeArguments: [
          factory.TypeReferenceNode.create({
            name: "T",
          }),
        ],
      });

  const functionType = factory.FunctionTypeNode.create({
    typeParameters: [
      factory.TypeParameterDeclaration.create({
        name: "T",
        defaultType: factory.TypeReferenceNode.create({
          name: "SuccessResponses",
        }),
      }),
    ],
    parameters: [httpMethod, url, headers, requestBody, queryParameters, options],
    type: returnType,
  });

  const requestFunction = factory.PropertySignature.create({
    name: "request",
    optional: false,
    type: functionType,
  });

  return [
    createHttpMethod(factory),
    createObjectLikeInterface(factory),
    ...createQueryParamsDeclarations(factory),
    createSuccessResponseTypeAlias("SuccessResponses", factory, successResponseNames),
    errorResponseNamespace,
    factory.InterfaceDeclaration.create({
      export: true,
      name: "ApiClient",
      members: [requestFunction],
      typeParameters: [
        factory.TypeParameterDeclaration.create({
          name: "RequestOption",
        }),
      ],
    }),
  ];
};
