import * as Formatter from "@himenon/openapi-parameter-formatter";

import { ApiClient, Client, HttpMethod, ObjectLike, QueryParameters } from "./client";

export interface RequestOption {
  retry?: number;
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
    const query = Object.entries(queryParameters || {}).reduce((queryString, [key, item]) => {
      if (!item.style) {
        return queryString + "&" + `${key}=${item}`;
      }
      const result = Formatter.QueryParameter.generate(key, item as Formatter.QueryParameter.Parameter);
      if (result) {
        return queryString + "&" + result;
      }
      return queryString;
    }, "");
    const requestUrl = query.length > 0 ? url + "?" + query : url;
    console.log({
      requestUrl,
      httpMethod,
      headers,
      requestBody,
      options,
    });
    return Promise.resolve(); // you can use fetch or axios or superagent api libraries
  },
};

const main = async () => {
  const client = new Client<RequestOption>(apiClientImpl, "https://example.com");
  await client.getBooks({
    retry: 50,
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
