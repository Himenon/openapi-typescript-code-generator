import * as Name from "./Name";
/**
 * ユーザーが利用できる各種変換オプション
 */
// export interface Options {

// }

interface ReferenceNameOption {
  escape?: boolean;
  reservedWordEscape?: boolean;
}

export interface Types {
  referenceName: (name: string, options?: ReferenceNameOption) => string;
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
    return text.replace(/-/g, "_");
  };
  return {
    referenceName: (name: string, options?: ReferenceNameOption) => {
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
  };
};
