import * as axios from "axios";

import { ApiClient, RequestArgs, createClient } from "./client";
import { generateQueryString } from "./utils";

export interface RequestOption {
  retries?: number;
  timeout?: number;
  deadline?: number;
}

const apiClientImpl: ApiClient<RequestOption> = {
  request: async (requestArgs: RequestArgs, options?: RequestOption): Promise<any> => {
    const { httpMethod, url, headers, requestBody, queryParameters } = requestArgs;
    const query = generateQueryString(queryParameters);
    const requestUrl = query ? `${url}?${encodeURI(query)}` : url;
    const response = await axios.default.request({
      url: requestUrl,
      method: httpMethod,
      headers,
      data: requestBody,
      timeout: options?.timeout,
    });
    return response.data;
  },
};

const main = async () => {
  const client = createClient<RequestOption>(apiClientImpl, "https://example.com");
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

main().catch(error => {
  console.error(error);
  process.exit(1);
});
