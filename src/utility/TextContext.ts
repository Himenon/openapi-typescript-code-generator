import type { NamedContext } from "./NamedContext";

export class TextContext {
  constructor(private namedContext: NamedContext) {}
  public convertReservedWord(word: string): string {
    if (["import", "export"].includes(word)) {
      return word + "_";
    }
    return word;
  }
  public convertString(text: string): string {
    if (this.namedContext.isAvailableVariableName(text)) {
      return text;
    }
    return text.replace(/-/g, "$").replace(/\//g, "$");
  }
  /**
   * operationIdに対するescape
   */
  public escapeOperationIdText(operationId: string): string {
    return this.convertString(operationId);
  }
  /**
   * interface/namespace/typeAliasのnameをescapeする
   * import/exportなどの予約語も裁く
   */
  public escapeDeclarationText(text: string): string {
    return this.convertReservedWord(this.convertString(text));
  }
  /**
   * 非破壊: PropertySignatureのname用のescape
   */
  public escapePropertySignatureName(text: string): string {
    return this.namedContext.escapeText(text);
  }
  /**
   * 破壊: TypeReferenceのname用のescape
   */
  public escapeTypeReferenceNodeName(text: string): string {
    return this.convertString(text);
  }
  public generateResponseName(operationId: string, statusCode: string): string {
    return this.namedContext.responseName(this.convertString(operationId), statusCode);
  }
  public generateArgumentParamsTypeDeclaration(operationId: string): string {
    return this.namedContext.argumentParamsTypeDeclaration(this.convertString(operationId));
  }
  public generateRequestContentTypeName(operationId: string): string {
    return this.namedContext.requestContentType(this.convertString(operationId));
  }
  public generateResponseContentTypeName(operationId: string): string {
    return this.namedContext.responseContentType(this.convertString(operationId));
  }
  public generateParameterName(operationId: string): string {
    return this.namedContext.parameterName(this.convertString(operationId));
  }
  public generateRequestBodyName(operationId: string): string {
    return this.namedContext.requestBodyName(this.convertString(operationId));
  }
  public generateFunctionName(operationId: string): string {
    return this.convertString(operationId);
  }
}
