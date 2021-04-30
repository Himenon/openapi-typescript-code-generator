import type { OpenApi } from "../../../types";
import * as ADS from "../../AbstractDataStructure";
import { UnSupportError } from "../../Exception";
import * as Guard from "../Guard";
import * as InferredType from "../InferredType";
import * as Name from "../Name";
import type { Payload } from "../types/tmp";
import type * as Walker from "../Walker";
import * as Reference from "./Reference";
import * as Schema from "./Schema";

const createNullableTypeNode = (schema: OpenApi.Schema): ADS.UnionStruct | undefined => {
  if (!schema.type && typeof schema.nullable === "boolean") {
    return {
      kind: "union",
      structs: [
        {
          kind: "any",
        },
        {
          kind: "null",
        },
      ],
    };
  }
};

export const generateNamespace = (payload: Payload, store: Walker.Store, schemas: Record<string, OpenApi.Schema | OpenApi.Reference>): void => {
  const basePath = "components/schemas";
  store.addComponent("schemas", {
    kind: "namespace",
    name: Name.Components.Schemas,
  });
  Object.entries(schemas).forEach(([name, targetSchema]) => {
    if (Guard.isReference(targetSchema)) {
      const schema = targetSchema;
      const reference = Reference.generate<OpenApi.Schema>(payload.entryPoint, payload.currentPoint, schema);
      if (reference.type === "local") {
        const { maybeResolvedName } = payload.context.resolveReferencePath(payload.currentPoint, reference.path);
        store.addAbstractDataStruct(`${basePath}/${name}`, {
          kind: "typedef",
          name: payload.converterContext.escapeDeclarationText(name),
          struct: {
            kind: "alias",
            name: payload.converterContext.escapeDeclarationText(name),
            schema: {
              kind: "reference",
              name: payload.converterContext.escapeDeclarationText(maybeResolvedName),
            },
          },
        });
        return;
      }
      Schema.addSchema({ ...payload, currentPoint: reference.referencePoint }, store, reference.path, reference.name, reference.data);
      if (store.hasStatement(`${basePath}/${name}`, ["interface", "typeAlias"])) {
        return;
      }
      return store.addAbstractDataStruct(`${basePath}/${name}`, {
        kind: "typedef",
        name: payload.converterContext.escapeDeclarationText(name),
        struct: {
          kind: "alias",
          name: payload.converterContext.escapeDeclarationText(name),
          comment: reference.data.description,
          schema: {
            kind: "reference",
            name: payload.converterContext.escapeDeclarationText(
              payload.context.resolveReferencePath(payload.currentPoint, reference.path).name,
            ),
          },
        },
      });
    }
    const schema = InferredType.getInferredType(targetSchema);
    if (!schema) {
      const typeNode = createNullableTypeNode(targetSchema);
      if (!typeNode) {
        throw new UnSupportError("schema.type not specified \n" + JSON.stringify(targetSchema));
      }
      return typeNode;
    }
    const path = `${basePath}/${name}`;
    if (Guard.isAllOfSchema(schema)) {
      return store.addAbstractDataStruct(path, {
        kind: "typedef",
        name: payload.converterContext.escapeDeclarationText(name),
        struct: Schema.generateMultiTypeAlias(payload, name, schema.allOf, "allOf"),
      });
    }
    if (Guard.isOneOfSchema(schema)) {
      return store.addAbstractDataStruct(path, {
        kind: "typedef",
        name: payload.converterContext.escapeDeclarationText(name),
        struct: Schema.generateMultiTypeAlias(payload, name, schema.oneOf, "oneOf"),
      });
    }
    if (Guard.isAnyOfSchema(schema)) {
      return store.addAbstractDataStruct(path, {
        kind: "typedef",
        name: payload.converterContext.escapeDeclarationText(name),
        struct: Schema.generateMultiTypeAlias(payload, name, schema.anyOf, "anyOf"),
      });
    }
    if (Guard.isArraySchema(schema)) {
      return store.addAbstractDataStruct(path, {
        kind: "typedef",
        name: payload.converterContext.escapeDeclarationText(name),
        struct: Schema.generateArrayTypeAlias(payload, name, schema),
      });
    }
    if (Guard.isObjectSchema(schema)) {
      return store.addAbstractDataStruct(path, {
        kind: "typedef",
        name: payload.converterContext.escapeDeclarationText(name),
        struct: Schema.generateInterface(payload, name, schema),
      });
    }
    if (Guard.isObjectSchema(schema)) {
      return store.addAbstractDataStruct(path, {
        kind: "typedef",
        name: payload.converterContext.escapeDeclarationText(name),
        struct: Schema.generateInterface(payload, name, schema),
      });
    }
    if (Guard.isPrimitiveSchema(schema)) {
      return store.addAbstractDataStruct(path, {
        kind: "typedef",
        name,
        struct: Schema.generateTypeAlias(payload, name, schema),
      });
    }
    throw new UnSupportError("schema.type = Array[] not supported. " + JSON.stringify(schema));
  });
};
