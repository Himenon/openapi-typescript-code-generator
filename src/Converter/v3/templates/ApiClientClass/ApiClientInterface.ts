import ts from "typescript";

import { Factory } from "../../../../TypeScriptCodeGenerator";

// export interface ApiClient<RequestOption> {
//   request: (
//     httpMethod: string,
//     url: string,
//     headers: { [key: string]: any } | undefined,
//     requestBody: { [key: string]: any } | undefined,
//     queryParameters: { [key: string]: any } | undefined,
//     options?: RequestOption,
//   ) => Promise<any>;
// }

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

export const create = (factory: Factory.Type): ts.Statement[] => {
  const objectLikeOrAnyType = factory.UnionTypeNode.create({
    typeNodes: [
      factory.TypeReferenceNode.create({
        name: "ObjectLike",
      }),
      factory.TypeNode.create({
        type: "undefined",
      }),
    ],
  });

  const httpMethod = factory.ParameterDeclaration.create({
    name: "httpMethod",
    type: factory.TypeNode.create({ type: "string" }),
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
    type: objectLikeOrAnyType,
  });
  const options = factory.ParameterDeclaration.create({
    name: "options",
    optional: true,
    type: factory.TypeReferenceNode.create({
      name: "RequestOption",
    }),
  });

  const functionType = factory.FunctionTypeNode.create({
    typeParameters: undefined,
    parameters: [httpMethod, url, headers, requestBody, queryParameters, options],
    type: factory.TypeReferenceNode.create({
      name: "Promise",
      typeArguments: [factory.TypeNode.create({ type: "any" })],
    }),
  });

  const requestFunction = factory.PropertySignature.create({
    name: "request",
    optional: false,
    type: functionType,
  });

  return [
    createObjectLikeInterface(factory),
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