import { EOL } from "os";

export interface Comment {
  hasTrailingNewLine: boolean;
  value: string;
}

export const isOnlyAlphabetText = (text: string): boolean => {
  return new RegExp(/^[a-zA-Z]+$/).test(text);
};

export const escapeIdentiferText = (text: string): string => {
  return text.replace(/-/g, "_");
};

export const generateComment = (comment: string, deprecated?: boolean): Comment => {
  const excapedComment = comment
    .replace(/\*\//, "\\*\\\\/") // */  -> \*\/
    .replace(/\/\*/, "/\\\\*") // /*  -> \/\*
    .replace(/\*\/\*/, "\\*\\/\\*"); // */* -> \*\/\*
  const splitComments = deprecated ? ["@deprecated"].concat(excapedComment.split(/\r?\n/)) : excapedComment.split(/\r?\n/);
  const comments = splitComments.filter((comment, index) => {
    if (index === splitComments.length - 1 && comment === "") {
      return false;
    }
    return true;
  });
  if (comments.length === 1) {
    return {
      hasTrailingNewLine: true,
      value: "* " + comments.join("") + " ",
    };
  }
  return {
    hasTrailingNewLine: true,
    value: "*" + EOL + comments.map(comment => ` * ${comment}`).join(EOL) + EOL + " ",
  };
};
