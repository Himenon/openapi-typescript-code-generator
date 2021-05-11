import type ts from "typescript";

import { TsGenerator } from "../../api";
import type { AbstractStruct, ParsedSchema } from "../../types";

const factory = TsGenerator.Factory.create();

interface Payload {
  accessor: ParsedSchema.Accessor;
  struct: AbstractStruct.Struct;
}

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

export const convertStructToTypeNode = (payload: Payload): ts.TypeNode => {
  const { struct, accessor } = payload;
  if (struct.kind === "reference") {
    if (struct.referenceType === "local") {
      const maybeResolvedName = struct.referencePath; // TODO wrap
      return factory.TypeReferenceNode.create({
        name: maybeResolvedName, // TODO wrap
      });
    }
    const childStruct = accessor.getChildByPaths(struct.referencePath, "abstract-data");
    if (!childStruct) {
      throw new Error("Not found child struct");
    }
    return convertStructToTypeNode({
      ...payload,
      struct: childStruct.value,
    });
  }
  if (struct.kind === "union") {
  }
  if (struct.kind === "intersection") {
  }
  if (struct.kind === "any") {
  }
  if (struct.kind === "boolean") {
    const typeNode = factory.TypeNode.create({
      type: "boolean",
    });
    return nullable(typeNode, !!struct.nullable);
  }
  if (struct.kind === "object") {
    const required: string[] = struct.raw.required || [];
    // // https://swagger.io/docs/specification/data-models/dictionaries/#free-form
    if (struct.additionalProperties === true) {
      return factory.TypeNode.create({
        type: "object",
        value: [],
      });
    }
    const value: ts.PropertySignature[] = struct.properties.map(memberStruct => {
      if (memberStruct.kind === "PropertySignature") {
        return factory.PropertySignature.create({
          name: memberStruct.name, // TODO Wrap
          type: convertStructToTypeNode({
            ...payload,
            struct: memberStruct.struct,
          }),
          optional: memberStruct.optional,
          comment: memberStruct.comment,
        });
      }
      throw new Error("test");
    });
    if (struct.additionalProperties) {
      const additionalProperties = factory.IndexSignatureDeclaration.create({
        name: "key",
        type: convertStructToTypeNode({
          ...payload,
          struct: struct.additionalProperties.struct,
        }),
      });
      return factory.TypeNode.create({
        type: "object",
        value: [...value, additionalProperties],
      });
    }
    const typeNode = factory.TypeNode.create({
      type: "object",
      value,
    });
    return nullable(typeNode, true);
  }
};
