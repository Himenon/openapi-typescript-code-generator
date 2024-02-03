import { ApiClient, Client, HttpMethod, ObjectLike, QueryParameters } from "./client";
import { generateQueryString } from "./utils";

export interface RequestOption {
  timeout?: number;
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
    console.log({
      httpMethod,
      url,
      query,
      requestUrl,
      headers,
      requestBody,
      options,
    });
    return Promise.resolve();
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

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
