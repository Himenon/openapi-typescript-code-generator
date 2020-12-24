import { EOL } from "os";
import { OpenApi } from "../OpenApiParser";

export const addComment = (comment?: string, server?: OpenApi.Server): string | undefined => {
  if (!server) {
    return comment;
  }
  return [comment, server.url, server.description].filter(Boolean).join(EOL);
};
