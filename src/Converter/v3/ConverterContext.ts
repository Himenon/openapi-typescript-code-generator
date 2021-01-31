import * as Name from "./Name";
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
    if (Name.isAvailableVariableName(text)) {
      return text;
    }
    return text.replace(/-/g, "_").replace(/\//g, "$");
  };
  return {
    escapeOperationIdText: (operationId: string): string => {
      return convertString(operationId);
    },
    escapeDeclarationText: (text: string) => {
      return convertReservedWord(convertString(text));
    },
    escapePropertySignatureName: (text: string) => {
      return Name.escapeText(text);
    },
    escapeTypeReferenceNodeName: (text: string) => {
      return convertString(text);
    },
    generateResponseName: (operationId: string, statusCode: string): string => {
      return Name.responseName(convertString(operationId), statusCode);
    },
    generateArgumentParamsTypeDeclaration: (operationId: string) => {
      return Name.argumentParamsTypeDeclaration(convertString(operationId));
    },
    generateRequestContentTypeName: (operationId: string) => {
      return Name.requestContentType(convertString(operationId));
    },
    generateResponseContentTypeName: (operationId: string) => {
      return Name.responseContentType(convertString(operationId));
    },
    generateParameterName: (operationId: string) => {
      return Name.parameterName(convertString(operationId));
    },
    generateRequestBodyName: (operationId: string) => {
      return Name.requestBodyName(convertString(operationId));
    },
    generateFunctionName: (operationId: string) => {
      return convertString(operationId);
    },
  };
};
