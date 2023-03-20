import type { TsGenerator } from "../../../api";

export const create = (factory: TsGenerator.Factory.Type) => {
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: "Client",
    type: factory.TypeReferenceNode.create({
      name: `ReturnType<typeof createClient>`,
    })
  })
};
