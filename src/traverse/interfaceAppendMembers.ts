import * as ts from "typescript";
import { JSONSchema4 } from "json-schema";

export interface Params {
  schemas: JSONSchema4;
}

const createStringType = ({ factory }: ts.TransformationContext): ts.TypeNode => {
  return factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
};

const createAnyType = ({ factory }: ts.TransformationContext): ts.TypeNode => {
  return factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
};

const createNumberType = ({ factory }: ts.TransformationContext): ts.TypeNode => {
  return factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
};

const createNullType = ({ factory }: ts.TransformationContext): ts.TypeNode => {
  return factory.createLiteralTypeNode(factory.createNull());
};

const createBooleanType = ({ factory }: ts.TransformationContext): ts.TypeNode => {
  return factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
};

const createArrayType = ({ factory }: ts.TransformationContext, typeNode: ts.TypeNode): ts.TypeNode => {
  return factory.createArrayTypeNode(typeNode);
};

const createObjectMemberType = ({ factory }: ts.TransformationContext, members: readonly ts.TypeElement[] | undefined) => {
  return factory.createTypeLiteralNode(members);
};

/**
 * Don't use root schema root
 */
const createTypeNode = (context: ts.TransformationContext, schema: JSONSchema4): ts.TypeNode => {
  if (schema.type === "object") {
    if (!schema.properties) {
      return createObjectMemberType(context, []);
    }
    const members = Object.entries(schema.properties).map(([key, childSchema]) => {
      return context.factory.createPropertySignature(
        undefined,
        context.factory.createIdentifier(key),
        undefined,
        createTypeNode(context, childSchema),
      );
    });
    return createObjectMemberType(context, members);
  } else if (schema.type === "string") {
    return createStringType(context);
  } else if (schema.type === "array") {
    if (!schema.items) {
      return createArrayType(context, createAnyType(context));
    }
    if (!Array.isArray(schema.items)) {
      return createArrayType(context, createTypeNode(context, schema.items));
    }
    throw new Error("TODO");
  } else if (schema.type === "any") {
    return createAnyType(context);
  } else if (schema.type === "boolean") {
    return createBooleanType(context);
  } else if (schema.type === "number") {
    return createNumberType(context);
  } else if (schema.type === "integer") {
    return createNumberType(context);
  } else if (schema.type === "null") {
    return createNullType(context);
  }
  return createAnyType(context);
};

const createInterfaceFromRootObjectSchema = (context: ts.TransformationContext, schema: JSONSchema4): ts.PropertySignature[] => {
  if (schema.type !== "object" || !schema.properties) {
    return [];
  }
  return Object.entries(schema.properties).map(([key, childSchema]) => {
    return context.factory.createPropertySignature(
      undefined,
      context.factory.createIdentifier(key),
      undefined,
      createTypeNode(context, childSchema),
    );
  });
};

/**
 * interface名をrenameする
 */
export const traverse = (params: Params) => <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T) => {
  const visit = (node: ts.Node): ts.Node => {
    node = ts.visitEachChild(node, visit, context);
    if (!ts.isInterfaceDeclaration(node)) {
      return node;
    }
    return context.factory.createInterfaceDeclaration(
      undefined,
      undefined,
      node.name,
      undefined,
      undefined,
      createInterfaceFromRootObjectSchema(context, params.schemas),
    );
  };
  return ts.visitNode(rootNode, visit);
};
