import ts from "typescript";

import { Factory } from "../../../../../TypeScriptCodeGenerator";
import * as Utils from "../../utils";

export interface Params {
  variableName: string;
  object: { [key: string]: string };
  contentType: {
    Accept: string;
    "Content-Type": string;
  };
}

export const create = (factory: Factory.Type, params: Params): ts.VariableStatement => {
  const contentTypes = Object.entries(params.contentType).map(([key, value]) => {
    return factory.PropertyAssignment.create({
      name: Utils.isAlphabetOnlyText(key) ? key : `"${key}"`,
      initializer: factory.StringLiteral.create({ text: value }),
    });
  });

  return factory.VariableStatement.create({
    declarationList: factory.VariableDeclarationList.create({
      flag: "const",
      declarations: [
        factory.VariableDeclaration.create({
          name: params.variableName,
          initializer: Utils.generateObjectLiteralExpression(factory, params.object, contentTypes),
        }),
      ],
    }),
  });
};
