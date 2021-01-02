import * as Server from "./Server";
import { OpenApi } from "./types";

export const addComment = (comment: string | undefined, servers: OpenApi.Server[] = []): string | undefined => {
  return servers.reduce((newComment, server) => {
    return Server.addComment(newComment, server);
  }, comment);
};
