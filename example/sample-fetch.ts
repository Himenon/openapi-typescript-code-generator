import * as Formatter from "@himenon/openapi-parameter-formatter";
import fetch from "node-fetch";

import { ApiClient, Client, HttpMethod, ObjectLike, QueryParameters } from "./client";

export interface RequestOption {
  timeout?: number;
}

const generateQueryString = (queryParameters: QueryParameters | undefined): string | undefined => {
  if (!queryParameters) {
    return undefined;
  }
  return Object.entries(queryParameters).reduce((queryString, [key, item]) => {
    if (!item.style) {
      return queryString + "&" + `${key}=${item}`;
    }
    const result = Formatter.QueryParameter.generate(key, item as Formatter.QueryParameter.Parameter);
    if (result) {
      return queryString + "&" + result;
    }
    return queryString;
  }, "");
};

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
    const requestUrl = query ? url + "&" + query : url;
    const response = await fetch(requestUrl, {
      body: requestBody,
      headers,
      method: httpMethod,
      timeout: options?.timeout,
    });
    return await response.json();
  },
};

const main = async () => {
  const client = new Client<RequestOption>(apiClientImpl, "https://example.com");
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
