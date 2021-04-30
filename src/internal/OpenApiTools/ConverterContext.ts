import * as Utils from "../../utils";
import type { ConverterContext } from "./types/context";

export type Types = ConverterContext;

/**
 * ユーザーが利用できる各種変換オプション
 */
export const create = (): ConverterContext => {
  const convertReservedWord = (word: string): string => {
    if (["import", "export"].includes(word)) {
      return word + "_";
    }
    return word;
  };
  const convertString = (text: string): string => {
    if (Utils.isAvailableVariableName(text)) {
      return text;
    }
    return text.replace(/-/g, "$").replace(/\//g, "$");
  };
  return {
    escapeOperationIdText: (operationId: string): string => {
      return convertString(operationId);
    },
    escapeDeclarationText: (text: string) => {
      return convertReservedWord(convertString(text));
    },
    escapePropertySignatureName: (text: string) => {
      return Utils.escapeText(text);
    },
    escapeTypeReferenceNodeName: (text: string) => {
      return convertString(text);
    },
    generateResponseName: (operationId: string, statusCode: string): string => {
      return Utils.responseName(convertString(operationId), statusCode);
    },
    generateArgumentParamsTypeDeclaration: (operationId: string) => {
      return Utils.argumentParamsTypeDeclaration(convertString(operationId));
    },
    generateRequestContentTypeName: (operationId: string) => {
      return Utils.requestContentType(convertString(operationId));
    },
    generateResponseContentTypeName: (operationId: string) => {
      return Utils.responseContentType(convertString(operationId));
    },
    generateParameterName: (operationId: string) => {
      return Utils.parameterName(convertString(operationId));
    },
    generateRequestBodyName: (operationId: string) => {
      return Utils.requestBodyName(convertString(operationId));
    },
    generateFunctionName: (operationId: string) => {
      return convertString(operationId);
    },
  };
};
