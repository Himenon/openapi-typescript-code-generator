import { OpenApi310 } from "./OpenApiParser/Schema";
import * as TypeScriptCodeGenerator from "./TypeScriptCodeGenerator";

const create: TypeScriptCodeGenerator.CreateFunction = context => {
  const factory = TypeScriptCodeGenerator.Factory.create(context);
  const statement = factory.Interface({
    name: "Hoge2",
    export: true,
    members: [
      factory.Property({
        name: "hoge",
        optional: true,
        type: factory.TypeNode({
          type: "string",
        }),
      }),
    ],
  });

  return [
    factory.Namespace({
      name: "MyName",
      statements: [statement],
    }),
    factory.Namespace({
      name: "MyNam2",
      statements: [statement],
    }),
  ];
};

export const generateTypeScriptCode = (openapi: OpenApi310) => {
  console.info("DEBUG 中");
  TypeScriptCodeGenerator.generate(create);
  return JSON.stringify(openapi, null, 2);
};
