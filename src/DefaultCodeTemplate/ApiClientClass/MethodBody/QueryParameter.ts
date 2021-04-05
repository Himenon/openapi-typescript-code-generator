import ts from "typescript";

import type { Factory } from "../../../factory";
import * as Utils from "../../../utils";
import * as UtilsExtra from "../../utils";

export interface Item {
  type: "string" | "variable";
  value: string;
  style?: string;
  explode: boolean;
}

export interface Params {
  variableName: string;
  object: {
    [key: string]: Item;
  };
}

export const create = (factory: Factory.Type, params: Params): ts.VariableStatement => {
  const properties: ts.PropertyAssignment[] = Object.entries(params.object).reduce<ts.PropertyAssignment[]>((previous, [key, item]) => {
    const childProperties: ts.PropertyAssignment[] = [
      factory.PropertyAssignment.create({
        name: "value",
        initializer:
          item.type === "variable"
            ? UtilsExtra.generateVariableIdentifier(factory, item.value)
            : factory.StringLiteral.create({ text: item.value }),
      }),
    ];
    if (item.style) {
      childProperties.push(
        factory.PropertyAssignment.create({
          name: "style",
          initializer: factory.StringLiteral.create({ text: item.style }),
        }),
      );
    }
    childProperties.push(
      factory.PropertyAssignment.create({
        name: "explode",
        initializer: item.explode ? ts.factory.createTrue() : ts.factory.createFalse(),
      }),
    );
    const childObjectInitializer = factory.ObjectLiteralExpression.create({
      properties: childProperties,
    });
    const childObject = factory.PropertyAssignment.create({
      name: Utils.escapeText(key),
      initializer: childObjectInitializer,
    });
    return previous.concat(childObject);
  }, []);

  return factory.VariableStatement.create({
    declarationList: factory.VariableDeclarationList.create({
      flag: "const",
      declarations: [
        factory.VariableDeclaration.create({
          name: params.variableName,
          type: factory.TypeReferenceNode.create({
            name: "QueryParameters",
          }),
          initializer: factory.ObjectLiteralExpression.create({
            properties,
            multiLine: true,
          }),
        }),
      ],
    }),
  });
};
