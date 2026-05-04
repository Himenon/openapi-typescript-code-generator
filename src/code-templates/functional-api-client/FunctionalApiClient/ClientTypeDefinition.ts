<<<<<<< HEAD
=======
import type ts from "typescript";
>>>>>>> 7b64d04cab4a272c3f6e680fa294110083ae3879
import type { TsGenerator } from "../../../api";

export const create = (factory: TsGenerator.Factory.Type): string[] => {
  return [
    factory.TypeAliasDeclaration.create({
      name: "ClientFunction<RequestOption>",
      type: factory.TypeReferenceNode.create({
        name: "typeof createClient<RequestOption>",
      }),
    }),
    factory.TypeAliasDeclaration.create({
      export: true,
      name: "Client<RequestOption>",
      type: factory.TypeReferenceNode.create({
        name: "ReturnType<ClientFunction<RequestOption>>",
      }),
    }),
  ];
};
