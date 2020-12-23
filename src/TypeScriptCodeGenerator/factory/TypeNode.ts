import * as ts from "typescript";

export interface StringParams {
  type: "string";
}

export interface NumberParams {
  type: "number";
}

export interface BooleanParams {
  type: "boolean";
}

export interface ObjectParams {
  type: "object";
  value: ts.PropertySignature[];
}

export interface UndefinedParams {
  type: "undefined";
}

export interface NullParams {
  type: "null";
}

export type Params = StringParams | NumberParams | BooleanParams | ObjectParams | UndefinedParams | NullParams;

export const create = ({ factory }: ts.TransformationContext) => (params: Params): ts.TypeNode => {
  switch (params.type) {
    case "string":
      return factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    case "number":
      return factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    case "boolean":
      return factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
    case "object":
      return factory.createTypeLiteralNode(params.value);
    case "undefined":
      return factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);
    case "null":
      return factory.createLiteralTypeNode(factory.createNull());
    default:
      throw new Error("UnSupport Type");
  }
};
