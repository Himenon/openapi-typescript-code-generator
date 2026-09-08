import type { CodeGenerator, OpenApi } from "../../../types";

const httpMethodList = ["get", "put", "post", "delete", "options", "head", "patch", "trace", "query"] as const;

export interface State {
  [operationId: string]: CodeGenerator.OpenApiOperation;
}

type UniqueParameterMap = Record<string, OpenApi.Parameter>;

const uniqParameters = (rawParameters: OpenApi.Parameter[]): OpenApi.Parameter[] => {
  const parameterMap = rawParameters.reduce<UniqueParameterMap>((all, parameter) => {
    return { ...all, [`${parameter.in}:${parameter.name}`]: parameter };
  }, {});
  return Object.values(parameterMap);
};

export const create = (rootSchema: OpenApi.Document): State => {
  const paths = rootSchema.paths || {};
  const state: State = {};
  Object.entries(paths).forEach(([requestUri, pathItem]) => {
    const pathItemData = pathItem as OpenApi.PathItem;
    if (pathItemData.$ref) {
      return;
    }
    const operations: Record<string, OpenApi.Operation | undefined> = {
      ...Object.fromEntries(httpMethodList.map(httpMethod => [httpMethod, pathItemData[httpMethod]])),
      ...pathItemData.additionalOperations,
    };
    Object.entries(operations).forEach(([httpMethod, operation]) => {
      if (!operation) {
        return;
      }
      if (!operation.operationId) {
        return;
      }
      const parameters = [...(pathItemData.parameters || []), ...(operation.parameters || [])] as OpenApi.Parameter[];

      const requestBody = operation.requestBody as OpenApi.RequestBody | undefined;
      const hasValidMediaType = Object.values(requestBody?.content || {}).filter(mediaType => Object.values(mediaType).length > 0).length > 0;

      state[operation.operationId] = {
        httpMethod,
        requestUri,
        comment: [operation.summary, operation.description].filter(Boolean).join("\n"),
        deprecated: !!operation.deprecated,
        requestBody: hasValidMediaType ? requestBody : undefined,
        parameters: uniqParameters(parameters),
        responses: operation.responses as CodeGenerator.OpenApiResponses,
      };
    });
  });
  return state;
};
