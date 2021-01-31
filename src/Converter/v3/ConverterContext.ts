import * as Name from "./Name";
/**
 * ユーザーが利用できる各種変換オプション
 */
// export interface Options {

// }

export interface Types {
  referenceName: (name: string) => string;
}

/**
 * ユーザーが利用できる各種変換オプション
 */
export const create = (): Types => {
  return {
    referenceName: (name: string) => {
      if (Name.isAvailableVariableName(name)) {
        return name;
      }
      return name.replace(/-/g, "_");
    },
  };
};
