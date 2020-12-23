import * as ts from "typescript";

export interface StringParams {
  type: "string";
}

export interface IntegerParams {
  type: "integer";
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

export interface ArrayParams {
  type: "array";
  value: ts.TypeNode;
}

export interface NullParams {
  type: "null";
}

export type Params = StringParams | IntegerParams | NumberParams | BooleanParams | ObjectParams | ArrayParams | UndefinedParams | NullParams;

export type Factory = (params: Params) => ts.TypeNode;

export const create = ({ factory }: ts.TransformationContext): Factory => (params: Params): ts.TypeNode => {
  const createNode = () => {
    switch (params.type) {
      case "string":
        return factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
      case "number":
      case "integer":
        return factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
      case "boolean":
        return factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
      case "object":
        return factory.createTypeLiteralNode(params.value);
      case "undefined":
        return factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);
      case "null":
        return factory.createLiteralTypeNode(factory.createNull());
      case "array":
        return factory.createArrayTypeNode(params.value);
      default:
        throw new Error("UnSupport Type");
    }
  };
  const node = createNode();
  return node;
};
