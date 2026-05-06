import type { TsGenerator } from "../../../api";

/**
 * export class Client<ApiClient> {
 *   {members}
 * }
 */
export const create = (factory: TsGenerator.Factory.Type, members: string[]): string => {
  return factory.ClassDeclaration.create({
    name: "Client",
    export: true,
    members: [
      factory.PropertyDeclaration.create({
        modifiers: ["private"],
        name: "baseUrl",
        type: "string",
      }),
      ...members,
    ],
    typeParameterDeclaration: [
      factory.TypeParameterDeclaration.create({
        name: "RequestOption",
      }),
    ],
  });
};
