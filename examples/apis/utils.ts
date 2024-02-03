import * as Formatter from "@himenon/openapi-parameter-formatter";

import { QueryParameters } from "./client";

export const generateQueryString = (queryParameters: QueryParameters | undefined): string | undefined => {
  if (!queryParameters) {
    return undefined;
  }
  const queries = Object.entries(queryParameters).reduce<string[]>((queryStringList, [key, item]) => {
    if (!item.value) {
      return queryStringList;
    }
    if (!item.style) {
      return queryStringList.concat(`${key}=${item.value}`);
    }
    const result = Formatter.QueryParameter.generate(key, item as Formatter.QueryParameter.Parameter);
    if (result) {
      return queryStringList.concat(result);
    }
    return queryStringList;
  }, []);

  return queries.join("&");
};
