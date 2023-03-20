import ts from "typescript";
import type { TsGenerator } from "../../../api";

export const create = (factory: TsGenerator.Factory.Type): ts.TypeAliasDeclaration[] => {
  return [
    factory.TypeAliasDeclaration.create({
      name: "ClientFunction<RequestOption>",
      type: factory.TypeReferenceNode.create({
        name: `typeof createClient<RequestOption>`,
      })
    }),
    factory.TypeAliasDeclaration.create({
      export: true,
      name: "Client<RequestOption>",
      type: factory.TypeReferenceNode.create({
        name: `ReturnType<ClientFunction<RequestOption>>`,
      })
    })
  ]
};
