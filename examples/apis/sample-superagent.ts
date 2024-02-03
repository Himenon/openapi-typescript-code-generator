import * as Superagent from "superagent";

import { ApiClient, Client, HttpMethod, ObjectLike, QueryParameters } from "./client";
import { generateQueryString } from "./utils";

export interface RequestOption {
  retries?: number;
  timeout?: number;
  deadline?: number;
}

const apiClientImpl: ApiClient<RequestOption> = {
  request: (
    httpMethod: HttpMethod,
    url: string,
    headers: ObjectLike | any,
    requestBody: ObjectLike | any,
    queryParameters: QueryParameters | undefined,
    options?: RequestOption,
  ): Promise<any> => {
    const query = generateQueryString(queryParameters);
    const requestUrl = query ? url + "?" + encodeURI(query) : url;

    return new Promise((resolve, reject) => {
      const agent = Superagent;
      const request = agent(httpMethod, requestUrl);
      if (headers) {
        request.set(headers);
      }
      if (requestBody) {
        request.send(requestBody);
      }
      if (options) {
        options.retries && request.retry(options.retries);
        if ((options.timeout && options.timeout > 0) || (options.deadline && options.deadline > 0)) {
          request.timeout({ response: options.timeout, deadline: options.deadline });
        }
      }
      request.end((error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.body);
        }
      });
    });
  },
};

const main = async () => {
  const client = new Client<RequestOption>(apiClientImpl, "https://example.com");
  await client.getBooks({
    retries: 50,
  });
  await client.searchBooks({
    parameter: {
      filter: {
        title: "hoge",
        author: "fuga",
      },
    },
  });
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
