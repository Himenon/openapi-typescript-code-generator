import ts from "typescript";

import type { TsGenerator } from "../../../api";
import type { CodeGenerator } from "../../../types";
import { escapeText2 as escapeText } from "../../../utils";
import * as Utils from "../utils";
import * as CallRequest from "./CallRequest";
import * as HeaderParameter from "./HeaderParameter";
import * as PathParameter from "./PathParameter";
import * as QueryParameter from "./QueryParameter";
import type { MethodType } from "./types";
import { createEncodingMap } from "./createEncodingMap";

export const create = (factory: TsGenerator.Factory.Type, params: CodeGenerator.Params, methodType: MethodType): ts.Statement[] => {
  const statements: ts.Statement[] = [];
  const { convertedParams, operationParams } = params;
  const { pickedParameters } = convertedParams;

  // Generate Path Parameter
  const pathParameters = pickedParameters.filter(PathParameter.isPathParameter);
  statements.push(PathParameter.create(factory, params.operationParams.requestUri, pathParameters, methodType));

  /**
   * Create Variable: const header = {};
   */
  const initialHeaderObject: Utils.LiteralExpressionObject = {};
  if (convertedParams.has2OrMoreRequestContentTypes) {
    initialHeaderObject["Content-Type"] = {
      type: "variable",
      value: `params.headers.Content-Type`,
    };
  } else if (convertedParams.requestFirstContentType) {
    initialHeaderObject["Content-Type"] = {
      type: "string",
      value: convertedParams.requestFirstContentType,
    };
  }
  if (convertedParams.has2OrMoreSuccessResponseContentTypes) {
    initialHeaderObject["Accept"] = {
      type: "variable",
      value: `params.headers.Accept`,
    };
  } else if (convertedParams.successResponseFirstContentType) {
    initialHeaderObject["Accept"] = {
      type: "string",
      value: convertedParams.successResponseFirstContentType,
    };
  }

  // Generate Header Parameter
  const headerParameter = pickedParameters.filter(item => item.in === "header");
  const headerObject = Object.values(headerParameter).reduce<Utils.LiteralExpressionObject>((previous, current) => {
    return { ...previous, [current.name]: { type: "variable", value: `params.parameter.${current.name}` } };
  }, initialHeaderObject);
  statements.push(
    HeaderParameter.create(factory, {
      variableName: "headers",
      object: headerObject,
    }),
  );

  /**
   * Create Variable: const requestEncoding = {};
   */
  const content = operationParams.requestBody?.content;
  if (content) {
    const encodingMap = createEncodingMap(content);
    let identifier: ts.Identifier | undefined;
    if (convertedParams.has2OrMoreRequestContentTypes) {
      identifier = factory.Identifier.create({
        name: JSON.stringify(encodingMap, null, 2),
      });
    } else if (convertedParams.requestFirstContentType) {
      identifier = factory.Identifier.create({
        name: JSON.stringify({ [convertedParams.requestFirstContentType]: encodingMap[convertedParams.requestFirstContentType] }, null, 2),
      });
    }
    const requestEncodingsVariableStatement = factory.VariableStatement.create({
      declarationList: factory.VariableDeclarationList.create({
        flag: "const",
        declarations: [
          factory.VariableDeclaration.create({
            name: "requestEncodings",
            initializer: identifier,
            type: factory.TypeReferenceNode.create({
              name: "Record<string, Record<string, Encoding>>",
            }),
          }),
        ],
      }),
    });

    if (identifier && Object.keys(encodingMap).length > 0) {
      statements.push(requestEncodingsVariableStatement);
    }
  }

  // Generate Query Parameter
  if (convertedParams.hasQueryParameters) {
    const queryParameter = pickedParameters.filter(item => item.in === "query");
    const queryObject = Object.values(queryParameter).reduce<{ [key: string]: QueryParameter.Item }>((previous, current) => {
      const { text, escaped } = escapeText(current.name);
      const variableDeclareText = escaped ? `params.parameter[${text}]` : `params.parameter.${text}`;
      return {
        ...previous,
        [current.name]: { type: "variable", value: variableDeclareText, style: current.style, explode: !!current.explode },
      };
    }, {});
    statements.push(QueryParameter.create(factory, { variableName: "queryParameters", object: queryObject }));
  }

  // Generate CallRequest
  statements.push(
    factory.ReturnStatement.create({
      expression: CallRequest.create(factory, params, methodType),
    }),
  );

  return statements.length === 0 ? [factory.ReturnStatement.create({})] : statements;
};
