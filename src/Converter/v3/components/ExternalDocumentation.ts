import { EOL } from "os";

import { OpenApi } from "../types";

export const addComment = (comment?: string, externalDocs?: OpenApi.ExternalDocumentation): string | undefined => {
  if (!externalDocs) {
    return comment;
  }
  return [comment, "", `@see ${externalDocs.url}`, externalDocs.description].filter(Boolean).join(EOL);
};
