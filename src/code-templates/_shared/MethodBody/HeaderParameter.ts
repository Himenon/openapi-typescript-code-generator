<<<<<<< HEAD
=======
import type ts from "typescript";

>>>>>>> 7b64d04cab4a272c3f6e680fa294110083ae3879
import type { TsGenerator } from "../../../api";
import * as Utils from "../utils";

export interface Params {
  variableName: string;
  object: Utils.LiteralExpressionObject;
}

export const create = (factory: TsGenerator.Factory.Type, params: Params): string => {
  return factory.VariableStatement.create({
    declarationList: factory.VariableDeclarationList.create({
      flag: "const",
      declarations: [
        factory.VariableDeclaration.create({
          name: params.variableName,
          initializer: Utils.generateObjectLiteralExpression(factory, params.object),
        }),
      ],
    }),
  });
};
