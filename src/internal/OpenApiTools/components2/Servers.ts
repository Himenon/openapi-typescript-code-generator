import { EOL } from "os";

import type { OpenApi } from "../../../types";
import * as Server from "./Server";

export const addComment = (comments: (string | undefined)[], servers: OpenApi.Server[] = []): string | undefined => {
  const comment = comments.filter(Boolean).join(EOL) as string | undefined;
  return servers.reduce((newComment, server) => {
    return Server.addComment(newComment, server);
  }, comment);
};
