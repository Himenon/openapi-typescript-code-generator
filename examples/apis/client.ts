//
// Generated by @himenon/openapi-typescript-code-generator v0.7.2
//
// OpenApi : 3.0.3
//
// License  : MIT
//

export namespace schemas {
  export interface Author {
    id: string;
    /** author name */
    name: string;
  }
  export interface Book {
    title: string;
    author: Author;
    ISBN: string;
    publishAt: string;
    updatedAt: string;
  }
}
export namespace responses {
  /** Get Books */
  export namespace Books {
    export interface Content {
      "application/json": {
        books: schemas.Book[];
      };
    }
  }
}
export interface Response$getBooks$Status$200 {
  "application/json": {
    books: schemas.Book[];
  };
}
export interface Parameter$searchBooks {
  filter?: {
    title: string;
    author: string;
    [key: string]: string;
  };
}
export interface Response$searchBooks$Status$200 {
  "application/json": {
    books?: schemas.Book[];
  };
}
export type ResponseContentType$getBooks = keyof Response$getBooks$Status$200;
export type ResponseContentType$searchBooks = keyof Response$searchBooks$Status$200;
export interface Params$searchBooks {
  parameter: Parameter$searchBooks;
}
export type HttpMethod = "GET" | "PUT" | "POST" | "DELETE" | "OPTIONS" | "HEAD" | "PATCH" | "TRACE";
export interface ObjectLike {
  [key: string]: any;
}
export interface QueryParameter {
  value: any;
  style?: "form" | "spaceDelimited" | "pipeDelimited" | "deepObject";
  explode: boolean;
}
export interface QueryParameters {
  [key: string]: QueryParameter;
}
export type SuccessResponses = Response$getBooks$Status$200 | Response$searchBooks$Status$200;
export namespace ErrorResponse {
  export type getBooks = void;
  export type searchBooks = void;
}
export interface ApiClient<RequestOption> {
  request: <T = SuccessResponses>(
    httpMethod: HttpMethod,
    url: string,
    headers: ObjectLike | any,
    requestBody: ObjectLike | any,
    queryParameters: QueryParameters | undefined,
    options?: RequestOption,
  ) => Promise<T>;
}
export class Client<RequestOption> {
  constructor(
    private apiClient: ApiClient<RequestOption>,
    private baseUrl: string,
  ) {}
  public async getBooks(option?: RequestOption): Promise<Response$getBooks$Status$200["application/json"]> {
    const url = this.baseUrl + `/get/books`;
    const headers = {
      Accept: "application/json",
    };
    return this.apiClient.request("GET", url, headers, undefined, undefined, option);
  }
  public async searchBooks(params: Params$searchBooks, option?: RequestOption): Promise<Response$searchBooks$Status$200["application/json"]> {
    const url = this.baseUrl + `/search/books`;
    const headers = {
      Accept: "application/json",
    };
    const queryParameters: QueryParameters = {
      filter: { value: params.parameter.filter, style: "deepObject", explode: true },
    };
    return this.apiClient.request("GET", url, headers, undefined, queryParameters, option);
  }
}