import { Factory } from "../../../CodeGenerator";
import { UnSupportError } from "../../../Exception";
import * as Guard from "../Guard";
import * as Name from "../Name";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";
import * as Reference from "./Reference";
import * as Schema from "./Schema";

export const generateRemoteSchema = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  referencePoint: string,
  referenceName: string,
  schema: OpenApi.Schema,
  context: ToTypeNode.Context,
): void => {
  console.log({ schema });
  if (Guard.isAllOfSchema(schema)) {
    store.addStatement(referencePoint, {
      type: "typeAlias",
      name: referenceName,
      value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, referenceName, schema.allOf, context, "allOf"),
    });
  } else if (Guard.isOneOfSchema(schema)) {
    store.addStatement(referencePoint, {
      type: "typeAlias",
      name: referenceName,
      value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, referenceName, schema.oneOf, context, "oneOf"),
    });
  } else if (Guard.isAnyOfSchema(schema)) {
    store.addStatement(referencePoint, {
      type: "typeAlias",
      name: referenceName,
      value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, referenceName, schema.anyOf, context, "allOf"),
    });
  } else if (Guard.isArraySchema(schema)) {
    store.addStatement(referencePoint, {
      type: "typeAlias",
      name: referenceName,
      value: Schema.generateArrayTypeAlias(entryPoint, referencePoint, factory, referenceName, schema, context),
    });
  } else if (Guard.isObjectSchema(schema)) {
    store.addStatement(referencePoint, {
      type: "interface",
      name: referenceName,
      value: Schema.generateInterface(entryPoint, referencePoint, factory, referenceName, schema, context),
    });
  } else if (Guard.isPrimitiveSchema(schema)) {
    store.addStatement(referencePoint, {
      type: "typeAlias",
      name: referenceName,
      value: Schema.generateTypeAlias(entryPoint, referencePoint, factory, referenceName, schema),
    });
  }
};

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  schemas: OpenApi.MapLike<string, OpenApi.Schema | OpenApi.Reference>,
  context: ToTypeNode.Context,
): void => {
  const basePath = "components/schemas";
  store.addComponent("schemas", {
    type: "namespace",
    name: Name.Components.Schemas,
    value: factory.Namespace.create({
      export: true,
      name: Name.Components.Schemas,
      statements: [],
      comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#schemaObject`,
    }),
    statements: {},
  });
  Object.entries(schemas).forEach(([name, schema]) => {
    if (Guard.isReference(schema)) {
      const reference = Reference.generate<OpenApi.Schema>(entryPoint, currentPoint, schema);
      if (reference.type === "local") {
        const referenceName = context.getReferenceName(currentPoint, reference.path, "local");
        store.addStatement(`${basePath}/${name}`, {
          type: "typeAlias",
          name: name,
          value: factory.TypeAliasDeclaration.create({
            export: true,
            name: name,
            type: factory.TypeReferenceNode.create({
              name: referenceName,
            }),
          }),
        });
        return;
      }
      generateRemoteSchema(entryPoint, currentPoint, store, factory, reference.path, reference.name, reference.data, context);
      if (store.hasStatement(`${basePath}/${name}`, ["interface", "typeAlias"])) {
        return;
      }
      return store.addStatement(`${basePath}/${name}`, {
        type: "typeAlias",
        name,
        value: factory.TypeAliasDeclaration.create({
          export: true,
          name: name,
          type: factory.TypeReferenceNode.create({
            name: context.getReferenceName(currentPoint, reference.path, "remote"),
          }),
        }),
      });
    }
    const path = `${basePath}/${name}`;
    if (Guard.isAllOfSchema(schema)) {
      return store.addStatement(path, {
        type: "typeAlias",
        name,
        value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.allOf, context, "allOf"),
      });
    }
    if (Guard.isOneOfSchema(schema)) {
      return store.addStatement(path, {
        type: "typeAlias",
        name,
        value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.oneOf, context, "oneOf"),
      });
    }
    if (Guard.isAnyOfSchema(schema)) {
      return store.addStatement(path, {
        type: "typeAlias",
        name,
        value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.anyOf, context, "anyOf"),
      });
    }
    if (Guard.isArraySchema(schema)) {
      return store.addStatement(path, {
        type: "typeAlias",
        name,
        value: Schema.generateArrayTypeAlias(entryPoint, currentPoint, factory, name, schema, context),
      });
    }
    if (Guard.isObjectSchema(schema)) {
      return store.addStatement(path, {
        type: "interface",
        name,
        value: Schema.generateInterface(entryPoint, currentPoint, factory, name, schema, context),
      });
    }
    if (Guard.isObjectSchema(schema)) {
      return store.addStatement(path, {
        type: "interface",
        name,
        value: Schema.generateInterface(entryPoint, currentPoint, factory, name, schema, context),
      });
    }
    if (Guard.isPrimitiveSchema(schema)) {
      return store.addStatement(path, {
        type: "typeAlias",
        name,
        value: Schema.generateTypeAlias(entryPoint, currentPoint, factory, name, schema),
      });
    }
    throw new UnSupportError("schema.type = Array[] not supported. " + JSON.stringify(schema));
  });
};
