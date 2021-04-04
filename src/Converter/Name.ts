export const parameterName = (operationId: string): string => `Parameter$${operationId}`;
export const requestBodyName = (operationId: string): string => `RequestBody$${operationId}`;
export const argumentParamsTypeDeclaration = (operationId: string): string => `Params$${operationId}`;
export const responseName = (operationId: string, statusCode: string): string => `Response$${operationId}$Status$${statusCode}`;
export const requestContentType = (operationId: string): string => `RequestContentType$${operationId}`;
export const responseContentType = (operationId: string): string => `ResponseContentType$${operationId}`;

export const isAvailableVariableName = (text: string): boolean => {
  return /^[A-Za-z_0-9\s]+$/.test(text);
};

export const escapeText = (text: string): string => {
  if (isAvailableVariableName(text)) {
    return text;
  }
  return `"${text}"`;
};

export const Components = {
  Schemas: "Schemas",
  Parameters: "Parameters",
  Headers: "Headers",
  SecuritySchemas: "SecuritySchemas",
  PathItems: "PathItems",
  RequestBodies: "RequestBodies",
  Responses: "Responses",
} as const;

export const ComponentChild = {
  Header: "Header",
  Content: "Content",
  Response: "Response",
};
