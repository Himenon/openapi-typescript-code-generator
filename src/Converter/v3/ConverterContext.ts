import * as Name from "./Name";
/**
 * ユーザーが利用できる各種変換オプション
 */
// export interface Options {

// }

interface EscapeOption {
  /**
   * property nameなどをダブルクォーテーションで囲む
   */
  escape?: boolean;
  /**
   * 予約語などが含まれる場合、変換を行う
   */
  reservedWordEscape?: boolean;
}

export interface Types {
  escapeText: (name: string, options?: EscapeOption) => string;
  escapeOperationIdText: (operationId: string) => string;
  /**
   * 非破壊: PropertySignatureのname用のescape
   */
  escapePropertySignatureName: (text: string) => string;
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
    return text.replace(/-/g, "_").replace(/\//g, "__");
  };
  return {
    escapeOperationIdText: (operationId: string): string => {
      return convertString(operationId);
    },
    escapeText: (name: string, options?: EscapeOption) => {
      const opt = options || {};
      let resultText = convertString(name);
      if (opt.escape) {
        resultText = Name.escapeText(resultText);
      }
      if (opt.reservedWordEscape) {
        resultText = convertReservedWord(resultText);
      }
      return resultText;
    },
    escapePropertySignatureName: (text: string) => {
      return Name.escapeText(text);
    },
  };
};
