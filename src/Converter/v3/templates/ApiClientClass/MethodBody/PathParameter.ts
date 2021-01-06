import ts from "typescript";

import { Factory } from "../../../../../TypeScriptCodeGenerator";
import * as Utils from "../../utils";

export interface Param {
  name: string;
  in: "path";
  required: boolean;
  style?: "matrix" | "label" | "form" | "simple" | "spaceDelimited" | "pipeDelimited" | "deepObject";
  explode?: string;
}

export const isPathParameter = (params: any): params is Param => {
  return params.in === "path";
};

/**
 * const url = this.baseUrl + `[head]${params.parameter.[parameterName]}`;
 */
const generateUrlVariableStatement = (factory: Factory.Type, urlTemplate: Utils.Params$TemplateExpression): ts.VariableStatement => {
  return factory.VariableStatement.create({
    declarationList: factory.VariableDeclarationList.create({
      declarations: [
        factory.VariableDeclaration.create({
          name: "url",
          initializer: factory.BinaryExpression.create({
            left: factory.PropertyAccessExpression.create({
              name: "baseUrl",
              expression: "this",
            }),
            operator: "+",
            right: Utils.generateTemplateExpression(factory, urlTemplate),
          }),
        }),
      ],
      flag: "const",
    }),
  });
};

const generateUrlTemplateExpression = (factory: Factory.Type, requestUri: string, pathParameters: Param[]): Utils.Params$TemplateExpression => {
  const patternMap = pathParameters.reduce<{ [key: string]: string }>((previous, item) => {
    return { ...previous, [`{${item.name}}`]: item.name };
  }, {});
  const urlTemplate: Utils.Params$TemplateExpression = [];
  let temporaryStringList: string[] = [];
  const replaceText = (text: string): string | undefined => {
    let replacedText = text;
    Object.keys(patternMap).forEach(key => {
      if (new RegExp(key).test(replacedText)) {
        replacedText = replacedText.replace(new RegExp(key, "g"), `params.parameter.${patternMap[key]}`);
      }
    });
    return replacedText === text ? undefined : replacedText;
  };
  const requestUrlTicks = requestUri.split("/");
  requestUrlTicks.forEach((requestUriTick, index) => {
    if (requestUri === "") {
      temporaryStringList.push("");
      return;
    }
    const replacedText = replaceText(requestUriTick);
    if (replacedText) {
      temporaryStringList.push(""); // ${a.b.c} は先頭に`/`をつけないため
      if (temporaryStringList.length > 0) {
        urlTemplate.push({
          type: "string",
          value: temporaryStringList.join("/"),
        });
        temporaryStringList = [];
      }
      urlTemplate.push({
        type: "property",
        value: Utils.generateVariableIdentifier(factory, replacedText),
      });
    } else {
      temporaryStringList.push(requestUriTick);
    }
    if (index === requestUrlTicks.length - 1) {
      urlTemplate.push({
        type: "string",
        value: temporaryStringList.join("/"),
      });
    }
  });
  return urlTemplate;
};

export const create = (factory: Factory.Type, requestUri: string, pathParameters: Param[]): ts.VariableStatement => {
  if (pathParameters.length > 0) {
    const urlTemplate = generateUrlTemplateExpression(factory, requestUri, pathParameters);
    return generateUrlVariableStatement(factory, urlTemplate);
  }
  return generateUrlVariableStatement(factory, [{ type: "string", value: requestUri }]);
};
