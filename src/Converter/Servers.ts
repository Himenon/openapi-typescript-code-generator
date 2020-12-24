import { OpenApi } from "../OpenApiParser";
import * as Server from "./Server";

export const addComment = (comment: string | undefined, servers: OpenApi.Server[] = []): string | undefined => {
  return servers.reduce((newComment, server) => {
    return Server.addComment(newComment, server);
  }, comment);
};
