import { EOL } from "os";

export const generateComment = (comment: string): string => {
  const splitComments = comment.split(EOL);
  const comments = splitComments.filter((comment, index) => {
    if (index === splitComments.length - 1 && comment === "") {
      return false;
    }
    return true;
  });
  return "*" + EOL + comments.map(comment => ` * ${comment}`).join(EOL) + EOL + " ";
};
