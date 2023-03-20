import ts from "typescript";

import type { TsGenerator } from "../../../api";
import type { CodeGenerator } from "../../../types";
import * as Utils from "../../class-api-client/utils";
import { escapeText2 as escapeText } from "../../../utils";
import type { MethodType } from "./types";

export const isPathParameter = (params: any): params is CodeGenerator.PickedParameter => {
  return params.in === "path";
};

/**
 * const url = this.baseUrl + `[head]${params.parameter.[parameterName]}`;
 */
const generateUrlVariableStatement = (
  factory: TsGenerator.Factory.Type,
  urlTemplate: Utils.Params$TemplateExpression,
  methodType: MethodType,
): ts.VariableStatement => {
  const left: Record<MethodType, ts.Expression> = {
    class: factory.PropertyAccessExpression.create({
      name: "baseUrl",
      expression: "this",
    }),
    function: factory.Identifier.create({
      name: "baseUrl",
    }),
  };
  return factory.VariableStatement.create({
    declarationList: factory.VariableDeclarationList.create({
      declarations: [
        factory.VariableDeclaration.create({
          name: "url",
          initializer: factory.BinaryExpression.create({
            left: left[methodType],
            operator: "+",
            right: Utils.generateTemplateExpression(factory, urlTemplate),
          }),
        }),
      ],
      flag: "const",
    }),
  });
};

export const generateUrlTemplateExpression = (
  factory: TsGenerator.Factory.Type,
  requestUri: string,
  pathParameters: CodeGenerator.PickedParameter[],
): Utils.Params$TemplateExpression => {
  const patternMap = pathParameters.reduce<{ [key: string]: string }>((previous, item) => {
    return { ...previous, [`{${item.name}}`]: item.name };
  }, {});
  const urlTemplate: Utils.Params$TemplateExpression = [];
  let temporaryStringList: string[] = [];
  // TODO generateVariableIdentifierに噛み合わ下げいいように変換する
  const replaceText = (text: string): string | undefined => {
    let replacedText = text;
    Object.keys(patternMap).forEach(pathParameterName => {
      if (new RegExp(pathParameterName).test(replacedText)) {
        const { text, escaped } = escapeText(patternMap[pathParameterName]);
        const variableDeclaraText = escaped ? `params.parameter[${text}]` : `params.parameter.${text}`;
        replacedText = replacedText.replace(new RegExp(pathParameterName, "g"), variableDeclaraText);
      }
    });
    return replacedText === text ? undefined : replacedText;
  };

  const requestUrlTicks: string[] = Utils.multiSplitStringToArray(requestUri, Object.keys(patternMap));
  requestUrlTicks.forEach((requestUriTick, index) => {
    if (requestUri === "") {
      temporaryStringList.push("");
      return;
    }
    const replacedText = replaceText(requestUriTick);
    if (replacedText) {
      if (temporaryStringList.length > 0) {
        const value = temporaryStringList.join("/");
        urlTemplate.push({
          type: "string",
          value: value,
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
      const value = temporaryStringList.join("/");
      if (value === "") {
        urlTemplate.push({
          type: "string",
          value: requestUri.endsWith("/") ? "/" : "",
        });
      } else {
        urlTemplate.push({
          type: "string",
          value: value.startsWith("/") ? value : "/" + value,
        });
      }
    }
  });
  return urlTemplate;
};

export const create = (
  factory: TsGenerator.Factory.Type,
  requestUri: string,
  pathParameters: CodeGenerator.PickedParameter[],
  methodType: MethodType,
): ts.VariableStatement => {
  if (pathParameters.length > 0) {
    const urlTemplate = generateUrlTemplateExpression(factory, requestUri, pathParameters);
    return generateUrlVariableStatement(factory, urlTemplate, methodType);
  }
  return generateUrlVariableStatement(factory, [{ type: "string", value: requestUri }], methodType);
};
