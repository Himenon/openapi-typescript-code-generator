import type { OpenApi } from "../../../types";
import { UnSupportError } from "../../Exception";
import { Factory } from "../../TsGenerator";
import * as ConverterContext from "../ConverterContext";
import * as Guard from "../Guard";
import * as InferredType from "../InferredType";
import * as Name from "../Name";
import * as ToTypeNode from "../toTypeNode";
import type * as Walker from "../Walker";
import * as Reference from "./Reference";
import * as Schema from "./Schema";

const createNullableTypeNode = (factory: Factory.Type, schema: OpenApi.Schema) => {
  if (!schema.type && typeof schema.nullable === "boolean") {
    const typeNode = factory.TypeNode.create({
      type: "any",
    });
    return factory.UnionTypeNode.create({
      typeNodes: [
        typeNode,
        factory.TypeNode.create({
          type: "null",
        }),
      ],
    });
  }
};

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Walker.Store,
  factory: Factory.Type,
  schemas: Record<string, OpenApi.Schema | OpenApi.Reference>,
  context: ToTypeNode.Context,
  convertContext: ConverterContext.Types,
): void => {
  const basePath = "components/schemas";
  store.addComponent("schemas", {
    kind: "namespace",
    name: Name.Components.Schemas,
  });
  Object.entries(schemas).forEach(([name, targetSchema]) => {
    if (Guard.isReference(targetSchema)) {
      const schema = targetSchema;
      const reference = Reference.generate<OpenApi.Schema>(entryPoint, currentPoint, schema);
      if (reference.type === "local") {
        const { maybeResolvedName } = context.resolveReferencePath(currentPoint, reference.path);
        store.addAbstractDataStruct(`${basePath}/${name}`, {
          kind: "typedef",
          name: convertContext.escapeDeclarationText(name),
          struct: {
            kind: "alias",
            name: convertContext.escapeDeclarationText(name),
            schema: {
              kind: "reference",
              name: convertContext.escapeDeclarationText(maybeResolvedName),
            },
          },
        });
        return;
      }
      Schema.addSchema(
        entryPoint,
        reference.referencePoint,
        store,
        factory,
        reference.path,
        reference.name,
        reference.data,
        context,
        convertContext,
      );
      if (store.hasStatement(`${basePath}/${name}`, ["interface", "typeAlias"])) {
        return;
      }
      return store.addAbstractDataStruct(`${basePath}/${name}`, {
        kind: "typedef",
        name: convertContext.escapeDeclarationText(name),
        struct: {
          kind: "alias",
          name: convertContext.escapeDeclarationText(name),
          comment: reference.data.description,
          schema: {
            kind: "reference",
            name: convertContext.escapeDeclarationText(context.resolveReferencePath(currentPoint, reference.path).name),
          },
        },
      });
    }
    const schema = InferredType.getInferredType(targetSchema);
    if (!schema) {
      const typeNode = createNullableTypeNode(factory, targetSchema);
      if (!typeNode) {
        throw new UnSupportError("schema.type not specified \n" + JSON.stringify(targetSchema));
      }
      return typeNode;
    }
    const path = `${basePath}/${name}`;
    if (Guard.isAllOfSchema(schema)) {
      return store.addAbstractDataStruct(path, {
        kind: "typedef",
        name: convertContext.escapeDeclarationText(name),
        struct: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.allOf, context, "allOf", convertContext),
      });
    }
    if (Guard.isOneOfSchema(schema)) {
      return store.addAbstractDataStruct(path, {
        kind: "typedef",
        name: convertContext.escapeDeclarationText(name),
        struct: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.oneOf, context, "oneOf", convertContext),
      });
    }
    if (Guard.isAnyOfSchema(schema)) {
      return store.addAbstractDataStruct(path, {
        kind: "typedef",
        name: convertContext.escapeDeclarationText(name),
        struct: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.anyOf, context, "anyOf", convertContext),
      });
    }
    if (Guard.isArraySchema(schema)) {
      return store.addAbstractDataStruct(path, {
        kind: "typedef",
        name: convertContext.escapeDeclarationText(name),
        struct: Schema.generateArrayTypeAlias(entryPoint, currentPoint, factory, name, schema, context, convertContext),
      });
    }
    if (Guard.isObjectSchema(schema)) {
      return store.addAbstractDataStruct(path, {
        kind: "typedef",
        name: convertContext.escapeDeclarationText(name),
        struct: Schema.generateInterface(entryPoint, currentPoint, factory, name, schema, context, convertContext),
      });
    }
    if (Guard.isObjectSchema(schema)) {
      return store.addAbstractDataStruct(path, {
        kind: "typedef",
        name: convertContext.escapeDeclarationText(name),
        struct: Schema.generateInterface(entryPoint, currentPoint, factory, name, schema, context, convertContext),
      });
    }
    if (Guard.isPrimitiveSchema(schema)) {
      return store.addAbstractDataStruct(path, {
        kind: "typedef",
        name,
        struct: Schema.generateTypeAlias(entryPoint, currentPoint, factory, name, schema, convertContext),
      });
    }
    throw new UnSupportError("schema.type = Array[] not supported. " + JSON.stringify(schema));
  });
};
