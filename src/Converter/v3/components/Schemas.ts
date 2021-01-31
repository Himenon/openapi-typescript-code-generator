import { Factory } from "../../../CodeGenerator";
import { UnSupportError } from "../../../Exception";
import * as ConverterContext from "../ConverterContext";
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
  schemas: Record<string, OpenApi.Schema | OpenApi.Reference>,
  context: ToTypeNode.Context,
  convertContext: ConverterContext.Types,
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
          name: convertContext.escapeText(name, { reservedWordEscape: true }),
          value: factory.TypeAliasDeclaration.create({
            export: true,
            name: convertContext.escapeText(name, { reservedWordEscape: true }),
            type: factory.TypeReferenceNode.create({
              name: convertContext.escapeText(maybeResolvedName, { reservedWordEscape: true }),
            }),
          }),
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
      return store.addStatement(`${basePath}/${name}`, {
        kind: "typeAlias",
        name: convertContext.escapeText(name, { reservedWordEscape: true }),
        value: factory.TypeAliasDeclaration.create({
          export: true,
          name: convertContext.escapeText(name, { reservedWordEscape: true }),
          comment: reference.data.description,
          type: factory.TypeReferenceNode.create({
            name: convertContext.escapeText(context.resolveReferencePath(currentPoint, reference.path).name, { reservedWordEscape: true }),
          }),
        }),
      });
    }
    const path = `${basePath}/${name}`;
    if (Guard.isAllOfSchema(schema)) {
      return store.addStatement(path, {
        kind: "typeAlias",
        name: convertContext.escapeText(name, { reservedWordEscape: true }),
        value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.allOf, context, "allOf", convertContext),
      });
    }
    if (Guard.isOneOfSchema(schema)) {
      return store.addStatement(path, {
        kind: "typeAlias",
        name: convertContext.escapeText(name, { reservedWordEscape: true }),
        value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.oneOf, context, "oneOf", convertContext),
      });
    }
    if (Guard.isAnyOfSchema(schema)) {
      return store.addStatement(path, {
        kind: "typeAlias",
        name: convertContext.escapeText(name, { reservedWordEscape: true }),
        value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.anyOf, context, "anyOf", convertContext),
      });
    }
    if (Guard.isArraySchema(schema)) {
      return store.addStatement(path, {
        kind: "typeAlias",
        name: convertContext.escapeText(name, { reservedWordEscape: true }),
        value: Schema.generateArrayTypeAlias(entryPoint, currentPoint, factory, name, schema, context, convertContext),
      });
    }
    if (Guard.isObjectSchema(schema)) {
      return store.addStatement(path, {
        kind: "interface",
        name: convertContext.escapeText(name, { reservedWordEscape: true }),
        value: Schema.generateInterface(entryPoint, currentPoint, factory, name, schema, context, convertContext),
      });
    }
    if (Guard.isObjectSchema(schema)) {
      return store.addStatement(path, {
        kind: "interface",
        name: convertContext.escapeText(name, { reservedWordEscape: true }),
        value: Schema.generateInterface(entryPoint, currentPoint, factory, name, schema, context, convertContext),
      });
    }
    if (Guard.isPrimitiveSchema(schema)) {
      return store.addStatement(path, {
        kind: "typeAlias",
        name,
        value: Schema.generateTypeAlias(entryPoint, currentPoint, factory, name, schema, convertContext),
      });
    }
    throw new UnSupportError("schema.type = Array[] not supported. " + JSON.stringify(schema));
  });
};
