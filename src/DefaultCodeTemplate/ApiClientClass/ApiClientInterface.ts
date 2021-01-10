import ts from "typescript";

import { Factory } from "../../CodeGenerator";

const httpMethodList: string[] = ["GET", "PUT", "POST", "DELETE", "OPTIONS", "HEAD", "PATCH", "TRACE"];

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
    createHttpMethod(factory),
    createObjectLikeInterface(factory),
    ...createQueryParamsDeclarations(factory),
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
