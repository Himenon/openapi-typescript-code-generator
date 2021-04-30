export interface ConverterContext {
  /**
   * operationIdに対するescape
   */
  escapeOperationIdText: (operationId: string) => string;
  /**
   * interface/namespace/typeAliasのnameをescapeする
   * import/exportなどの予約語も裁く
   */
  escapeDeclarationText: (text: string) => string;
  /**
   * 非破壊: PropertySignatureのname用のescape
   */
  escapePropertySignatureName: (text: string) => string;
  /**
   * 破壊: TypeReferenceのname用のescape
   */
  escapeTypeReferenceNodeName: (text: string) => string;
  generateResponseName: (operationId: string, statusCode: string) => string;
  generateArgumentParamsTypeDeclaration: (operationId: string) => string;
  generateRequestContentTypeName: (operationId: string) => string;
  generateResponseContentTypeName: (operationId: string) => string;
  generateParameterName: (operationId: string) => string;
  generateRequestBodyName: (operationId: string) => string;
  generateFunctionName: (operationId: string) => string;
}
