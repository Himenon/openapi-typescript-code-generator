import fetch, { Response } from "node-fetch";

import { ApiClient, Client, HttpMethod, ObjectLike, QueryParameters } from "./client";
import { generateQueryString } from "./utils";

export interface RequestOption {
  timeout?: number;
  onRawResponse?: (rawResponse: Response) => void;
}

const apiClientImpl: ApiClient<RequestOption> = {
  request: async (
    httpMethod: HttpMethod,
    url: string,
    headers: ObjectLike | any,
    requestBody: ObjectLike | any,
    queryParameters: QueryParameters | undefined,
    options?: RequestOption,
  ): Promise<any> => {
    const query = generateQueryString(queryParameters);
    const requestUrl = query ? url + "?" + encodeURI(query) : url;
    const response = await fetch(requestUrl, {
      body: JSON.stringify(requestBody),
      headers,
      method: httpMethod,
      timeout: options?.timeout,
    });
    options?.onRawResponse?.(response);
    return await response.json();
  },
};

const main = async () => {
  const client = new Client<RequestOption>(apiClientImpl, "http://localhost:3000");
  await client.getBooks({
    timeout: 1000,
  });
  const getSearcBookRawResponse = async () => {
    return new Promise<Response>(resolve => {
      client.searchBooks(
        {
          parameter: {
            filter: {
              title: "hoge",
              author: "fuga",
            },
          },
        },
        {
          onRawResponse: rawResponse => {
            resolve(rawResponse);
          },
        },
      );
    });
  };
  const res = await getSearcBookRawResponse();
  console.log(res.headers);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
