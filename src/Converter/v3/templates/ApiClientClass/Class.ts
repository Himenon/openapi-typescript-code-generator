import ts from "typescript";

import { Factory } from "../../../../TypeScriptCodeGenerator";

/**
 * export class Client<ApiClient> {
 *   {members}
 * }
 */
export const create = (factory: Factory.Type, members: ts.ClassElement[]): ts.ClassDeclaration => {
  return factory.ClassDeclaration.create({
    name: "Client",
    export: true,
    members,
    typeParameterDeclaration: [
      factory.TypeParameterDeclaration.create({
        name: "RequestOption",
      }),
    ],
  });
};
