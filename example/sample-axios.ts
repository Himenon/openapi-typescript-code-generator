import * as Formatter from "@himenon/openapi-parameter-formatter";
import * as axios from "axios";

import { ApiClient, Client, HttpMethod, ObjectLike, QueryParameters } from "./client";

export interface RequestOption {
  retries?: number;
  timeout?: number;
  deadline?: number;
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

const convertHttpMethodToAxiosMethod = (httpMethod: HttpMethod): axios.Method => {
  const patterns: { [key in HttpMethod]: axios.Method } = {
    GET: "GET",
    PUT: "PUT",
    POST: "POST",
    DELETE: "DELETE",
    OPTIONS: "OPTIONS",
    HEAD: "HEAD",
    PATCH: "PATCH",
    TRACE: "POST", // ?
  };
  return patterns[httpMethod];
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
    const response = await axios.default.request({
      url: requestUrl,
      method: convertHttpMethodToAxiosMethod(httpMethod),
      headers,
      data: requestBody,
      timeout: options?.timeout,
    });
    return response.data;
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

main().catch(error => {
  console.error(error);
  process.exit(1);
});
