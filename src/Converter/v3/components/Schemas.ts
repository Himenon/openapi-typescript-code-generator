import { Factory } from "../../../CodeGenerator";
import { UnSupportError } from "../../../Exception";
import * as Guard from "../Guard";
import * as Name from "../Name";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";
import * as Reference from "./Reference";
import * as Schema from "./Schema";

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
    kind: "namespace",
    name: Name.Components.Schemas,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#schemaObject`,
  });
  Object.entries(schemas).forEach(([name, schema]) => {
    if (Guard.isReference(schema)) {
      const reference = Reference.generate<OpenApi.Schema>(entryPoint, currentPoint, schema);
      if (reference.type === "local") {
        const { maybeResolvedName } = context.resolveReferencePath(currentPoint, reference.path);
        store.addStatement(`${basePath}/${name}`, {
          kind: "typeAlias",
          name: name,
          value: factory.TypeAliasDeclaration.create({
            export: true,
            name: name,
            type: factory.TypeReferenceNode.create({
              name: maybeResolvedName,
            }),
          }),
        });
        return;
      }
      Schema.addSchema(entryPoint, reference.referencePoint, store, factory, reference.path, reference.name, reference.data, context);
      if (store.hasStatement(`${basePath}/${name}`, ["interface", "typeAlias"])) {
        return;
      }
      return store.addStatement(`${basePath}/${name}`, {
        kind: "typeAlias",
        name,
        value: factory.TypeAliasDeclaration.create({
          export: true,
          name: name,
          comment: reference.data.description,
          type: factory.TypeReferenceNode.create({
            name: context.resolveReferencePath(currentPoint, reference.path).name,
          }),
        }),
      });
    }
    const path = `${basePath}/${name}`;
    if (Guard.isAllOfSchema(schema)) {
      return store.addStatement(path, {
        kind: "typeAlias",
        name,
        value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.allOf, context, "allOf"),
      });
    }
    if (Guard.isOneOfSchema(schema)) {
      return store.addStatement(path, {
        kind: "typeAlias",
        name,
        value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.oneOf, context, "oneOf"),
      });
    }
    if (Guard.isAnyOfSchema(schema)) {
      return store.addStatement(path, {
        kind: "typeAlias",
        name,
        value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.anyOf, context, "anyOf"),
      });
    }
    if (Guard.isArraySchema(schema)) {
      return store.addStatement(path, {
        kind: "typeAlias",
        name,
        value: Schema.generateArrayTypeAlias(entryPoint, currentPoint, factory, name, schema, context),
      });
    }
    if (Guard.isObjectSchema(schema)) {
      return store.addStatement(path, {
        kind: "interface",
        name,
        value: Schema.generateInterface(entryPoint, currentPoint, factory, name, schema, context),
      });
    }
    if (Guard.isObjectSchema(schema)) {
      return store.addStatement(path, {
        kind: "interface",
        name,
        value: Schema.generateInterface(entryPoint, currentPoint, factory, name, schema, context),
      });
    }
    if (Guard.isPrimitiveSchema(schema)) {
      return store.addStatement(path, {
        kind: "typeAlias",
        name,
        value: Schema.generateTypeAlias(entryPoint, currentPoint, factory, name, schema),
      });
    }
    throw new UnSupportError("schema.type = Array[] not supported. " + JSON.stringify(schema));
  });
};
