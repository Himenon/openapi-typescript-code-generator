import type ts from "typescript";

import { OpenApiTools, TsGenerator } from "../../api";
import type { AbstractStruct, OpenApi, ParsedSchema } from "../../types";
import type { ConvertContext, NamedContext } from "../../utils";;

const Guard = OpenApiTools.Guard;
const InferredType = OpenApiTools.InferredType;
const factory = TsGenerator.Factory.create();

interface Payload {
  accessor: ParsedSchema.Accessor;
  struct: AbstractStruct.SchemaLocation;
  convertContext: ConvertContext;
  renameContext: NamedContext;
}

export const generateMultiTypeNode = (payload: Payload, schemas: OpenApi.JSONSchema[], multiType: "oneOf" | "allOf" | "anyOf"): ts.TypeNode => {
  const typeNodes = schemas.map(schema =>
    convert({
      ...payload,
      struct: {
        kind: "common",
        schema,
      },
    }),
  );
  if (multiType === "oneOf") {
    return factory.UnionTypeNode.create({
      typeNodes,
    });
  }
  if (multiType === "allOf") {
    return factory.IntersectionTypeNode.create({
      typeNodes,
    });
  }
  // TODO Feature Development: Calculate intersection types
  return factory.TypeNode.create({ type: "never" });
};

const nullable = (typeNode: ts.TypeNode, nullable: boolean): ts.TypeNode => {
  if (nullable) {
    return factory.UnionTypeNode.create({
      typeNodes: [
        typeNode,
        factory.TypeNode.create({
          type: "null",
        }),
      ],
    });
  }
  return typeNode;
};

export const convert = (payload: Payload): ts.TypeNode => {
  const { struct, convertContext, renameContext } = payload;
  if (typeof struct.schema === "boolean") {
    // https://swagger.io/docs/specification/data-models/dictionaries/#free-form
    return factory.TypeNode.create({
      type: "object",
      value: [],
    });
  }
  if (struct.kind === "reference") {
    if (struct.referenceType === "local") {
      // Type Aliasを作成 (or すでにある場合は作成しない)
      // context.setReferenceHandler(currentPoint, reference);
      // const { maybeResolvedName } = context.resolveReferencePath(currentPoint, reference.path);
      return factory.TypeReferenceNode.create({ name: renameContext.escapeDeclarationText(maybeResolvedName) });
    }
    // サポートしているディレクトリに対して存在する場合
    if (reference.componentName) {
      // Type AliasもしくはInterfaceを作成
      // context.setReferenceHandler(currentPoint, reference);
      // Aliasを貼る
      return factory.TypeReferenceNode.create({ name: convertContext.resolveReferencePath(currentPoint, reference.path).name });
    }
    // サポートしていないディレクトリに存在する場合、直接Interface、もしくはTypeAliasを作成
    return convert({ ...payload, struct: { kind: "common", schema: struct.schema } });
  }

  const { schema } = struct;
  if (Guard.isOneOfSchema(schema)) {
    return generateMultiTypeNode(payload, schema.oneOf, "oneOf");
  }
  if (Guard.isAllOfSchema(schema)) {
    return generateMultiTypeNode(payload, schema.allOf, "allOf");
  }
  if (Guard.isAnyOfSchema(schema)) {
    return generateMultiTypeNode(payload, schema.anyOf, "anyOf");
  }

  if (Guard.isHasNoMembersObject(schema)) {
    return factory.TypeNode.create({
      type: "object",
      value: [],
    });
  }

  // schema.type
  if (!schema.type) {
    const inferredSchema = InferredType.getInferredType(schema);
    if (inferredSchema) {
      return convert({ ...payload, struct: { kind: "common", schema: inferredSchema } });
    }
    // typeを指定せずに、nullableのみを指定している場合に type object変換する
    if (typeof schema.nullable === "boolean") {
      const typeNode = factory.TypeNode.create({
        type: "any",
      });
      return nullable(typeNode, schema.nullable);
    }
    throw new Error("Please set 'type' or '$ref' property \n" + JSON.stringify(schema));
  }
  switch (schema.type) {
    case "boolean": {
      const typeNode = factory.TypeNode.create({
        type: "boolean",
      });
      return nullable(typeNode, !!schema.nullable);
    }
    case "null": {
      return factory.TypeNode.create({
        type: schema.type,
      });
    }
    case "integer":
    case "number": {
      const items = schema.enum;
      let typeNode: ts.TypeNode;
      if (items && Guard.isNumberArray(items)) {
        typeNode = factory.TypeNode.create({
          type: schema.type,
          enum: items,
        });
      } else {
        typeNode = factory.TypeNode.create({
          type: schema.type,
        });
      }
      return nullable(typeNode, !!schema.nullable);
    }
    case "string": {
      const items = schema.enum;
      let typeNode: ts.TypeNode;
      if (items && Guard.isStringArray(items)) {
        typeNode = factory.TypeNode.create({
          type: schema.type,
          enum: items,
        });
      } else {
        typeNode = factory.TypeNode.create({
          type: schema.type,
        });
      }
      return nullable(typeNode, !!schema.nullable);
    }
    case "array": {
      if (Array.isArray(schema.items) || typeof schema.items === "boolean") {
        throw new Error(`schema.items = ${JSON.stringify(schema.items)}`);
      }
      const typeNode = factory.TypeNode.create({
        type: schema.type,
        value: schema.items
          ? convert({ ...payload, struct: { kind: "common", schema: schema.items } })
          : factory.TypeNode.create({
              type: "undefined",
            }),
      });
      return nullable(typeNode, !!schema.nullable);
    }
    case "object": {
      const required: string[] = schema.required || [];
      // // https://swagger.io/docs/specification/data-models/dictionaries/#free-form
      if (schema.additionalProperties === true) {
        return factory.TypeNode.create({
          type: schema.type,
          value: [],
        });
      }
      const value: ts.PropertySignature[] = Object.entries(schema.properties || {}).map(([name, jsonSchema]) => {
        return factory.PropertySignature.create({
          name: converterContext.escapePropertySignatureName(name),
          type: convert({...payload, struct: { kind: "common", schema: jsonSchema }}),
          optional: !required.includes(name),
          comment: typeof jsonSchema !== "boolean" ? jsonSchema.description : undefined,
        });
      });
      if (schema.additionalProperties) {
        const additionalProperties = factory.IndexSignatureDeclaration.create({
          name: "key",
          type: convert({ ...payload, struct: { kind: "common", schema: schema.additionalProperties } }),
        });
        return factory.TypeNode.create({
          type: schema.type,
          value: [...value, additionalProperties],
        });
      }
      const typeNode = factory.TypeNode.create({
        type: schema.type,
        value,
      });
      return nullable(typeNode, !!schema.nullable);
    }
    default:
      return factory.TypeNode.create({
        type: "any",
      });
    // throw new UnknownError("what is this? \n" + JSON.stringify(schema, null, 2));
  }
};
