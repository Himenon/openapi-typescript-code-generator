import { EOL } from "os";

export const generateComment = (comment: string, deprecated?: boolean): string => {
  const splitComments = deprecated ? ["@deprecated"].concat(comment.split(EOL)) : comment.split(EOL);
  const comments = splitComments.filter((comment, index) => {
    if (index === splitComments.length - 1 && comment === "") {
      return false;
    }
    return true;
  });
  return "*" + EOL + comments.map(comment => ` * ${comment}`).join(EOL) + EOL + " ";
};
