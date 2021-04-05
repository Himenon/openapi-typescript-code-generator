import * as Utils from "../../utils";
/**
 * ユーザーが利用できる各種変換オプション
 */
// export interface Options {

// }

export interface Types {
  /**
   * operationIdに対するescape
   */
  escapeOperationIdText: (operationId: string) => string;
  /**
   * interface/namespace/typeAliasのnameをescapeする
   * import/exportなどの予約語も裁く
   */
  escapeDeclarationText: (text: string) => string;
  /**
   * 非破壊: PropertySignatureのname用のescape
   */
  escapePropertySignatureName: (text: string) => string;
  /**
   * 破壊: TypeReferenceのname用のescape
   */
  escapeTypeReferenceNodeName: (text: string) => string;
  generateResponseName: (operationId: string, statusCode: string) => string;
  generateArgumentParamsTypeDeclaration: (operationId: string) => string;
  generateRequestContentTypeName: (operationId: string) => string;
  generateResponseContentTypeName: (operationId: string) => string;
  generateParameterName: (operationId: string) => string;
  generateRequestBodyName: (operationId: string) => string;
  generateFunctionName: (operationId: string) => string;
}

/**
 * ユーザーが利用できる各種変換オプション
 */
export const create = (): Types => {
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
