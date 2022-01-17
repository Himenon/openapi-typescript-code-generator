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

/** TODO escapeTextにマージする */
export const escapeText2 = (text: string): { escaped: boolean; text: string } => {
  if (isAvailableVariableName(text)) {
    return {
      escaped: false,
      text: text,
    };
  }
  return {
    escaped: true,
    text: `"${text}"`,
  };
};
