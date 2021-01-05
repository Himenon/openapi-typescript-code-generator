import ts from "typescript";

import { Factory } from "../../../TypeScriptCodeGenerator";

export interface Params {
  name: string;
  parameterName?: string;
  requestBodyName?: string;
}

/**
 * Function Template
 *
 * export interface {name}<T extends keyof {requestBodyName}> {
 *   contentType: T;
 *   parameter: {parameterName};
 *   requestBody: {requestBodyName}[T];
 * }
 */
export const create = (factory: Factory.Type, { name, parameterName, requestBodyName }: Params): ts.InterfaceDeclaration => {
  const typeParameters: ts.TypeParameterDeclaration[] = [];
  const members: ts.TypeElement[] = [];
  const genericsName = "T";
  if (requestBodyName) {
    typeParameters.push(
      factory.TypeParameterDeclaration.create({
        name: genericsName,
        constraint: factory.TypeOperatorNode.create({
          syntaxKind: "keyof",
          type: factory.TypeReferenceNode.create({
            name: requestBodyName,
          }),
        }),
      }),
    );
  }

  if (parameterName) {
    const parameter = factory.PropertySignature.create({
      name: "parameter",
      optional: false,
      type: factory.TypeReferenceNode.create({
        name: parameterName,
      }),
    });
    members.push(parameter);
  }

  if (requestBodyName) {
    const contentType = factory.PropertySignature.create({
      name: "contentType",
      optional: false,
      type: factory.TypeReferenceNode.create({
        name: "T",
      }),
    });
    members.push(contentType);

    const requestBody = factory.PropertySignature.create({
      name: "requestBody",
      optional: false,
      type: factory.IndexedAccessTypeNode.create({
        objectType: factory.TypeReferenceNode.create({
          name: requestBodyName,
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
    name,
    members,
    typeParameters,
  });
};
