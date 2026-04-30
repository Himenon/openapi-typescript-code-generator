import fetch from "node-fetch";

import { ApiClient, RequestArgs, createClient } from "./client";
import { generateQueryString } from "./utils";

export interface RequestOption {
  timeout?: number;
}

const apiClientImpl: ApiClient<RequestOption> = {
  request: async (requestArgs: RequestArgs, _options?: RequestOption): Promise<any> => {
    const { httpMethod, url, headers, requestBody, queryParameters } = requestArgs;
    const query = generateQueryString(queryParameters);
    const requestUrl = query ? `${url}?${encodeURI(query)}` : url;
    const response = await fetch(requestUrl, {
      body: requestBody !== undefined ? JSON.stringify(requestBody) : undefined,
      headers: headers as Record<string, string>,
      method: httpMethod,
    });
    return await response.json();
  },
};

const main = async () => {
  const client = createClient<RequestOption>(apiClientImpl, "https://example.com");
  await client.getBooks({
    timeout: 1000,
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

main().catch(error => {
  console.error(error);
  process.exit(1);
});
