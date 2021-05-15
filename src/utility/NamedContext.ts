export interface NamedContext {
  parameterName(operationId: string): string;
  requestBodyName(operationId: string): string;
  argumentParamsTypeDeclaration(operationId: string): string;
  responseName(operationId: string, statusCode: string): string;
  requestContentType(operationId: string): string;
  responseContentType(operationId: string): string;
  isAvailableVariableName(text: string): boolean;
  escapeText(text: string): string;
}

export class NamedContext implements NamedContext {
  public static parameterName(operationId: string): string {
    return `Parameter$${operationId}`;
  }

  public static requestBodyName(operationId: string): string {
    return `RequestBody$${operationId}`;
  }

  public static argumentParamsTypeDeclaration(operationId: string): string {
    return `Params$${operationId}`;
  }

  public static responseName(operationId: string, statusCode: string): string {
    return `Response$${operationId}$Status$${statusCode}`;
  }

  public static requestContentType(operationId: string): string {
    return `RequestContentType$${operationId}`;
  }

  public static responseContentType(operationId: string): string {
    return `ResponseContentType$${operationId}`;
  }

  public static isAvailableVariableName(text: string): boolean {
    return /^[A-Za-z_0-9\s]+$/.test(text);
  }

  public static escapeText(text: string): string {
    if (this.isAvailableVariableName(text)) {
      return text;
    }
    return `"${text}"`;
  }
}
