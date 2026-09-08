import type { OpenApi } from "../../../types";
import { UnSupportError } from "../../Exception";
import * as Logger from "../..//Logger";
import type { Factory } from "../../TsGenerator";
import type * as ConverterContext from "../ConverterContext";
import * as Guard from "../Guard";
import * as InferredType from "../InferredType";
import * as Name from "../Name";
import * as ToTypeNode from "../toTypeNode";
import type * as Walker from "../Walker";
import * as Reference from "./Reference";
import * as Schema from "./Schema";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Walker.Store,
  factory: Factory.Type,
  schemas: Record<string, OpenApi.Schema | OpenApi.Reference | boolean>,
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
        const { maybeResolvedName, depth } = context.resolveReferencePath(currentPoint, reference.path);
        const functionalSiblings = Object.entries(schema).filter(([key]) => key !== "$ref" && key !== "summary" && key !== "description");
        const createTypeNode = () => {
          if (depth === 2 && functionalSiblings.length === 0) {
            return factory.TypeReferenceNode.create({
              name: convertContext.escapeReferenceDeclarationText(maybeResolvedName),
            });
          }
          const resolvedSchema = context.findSchemaByPathArray(currentPoint, reference.path.split("/"));
          const mergedSchema =
            functionalSiblings.length === 0 || typeof resolvedSchema === "boolean"
              ? resolvedSchema
              : { ...resolvedSchema, ...Object.fromEntries(functionalSiblings) };
          return ToTypeNode.convert(entryPoint, currentPoint, factory, mergedSchema, context, convertContext, { parent: schema });
        };
        return store.addStatement(`${basePath}/${name}`, {
          kind: "typeAlias",
          name: convertContext.escapeDeclarationText(name),
          value: factory.TypeAliasDeclaration.create({
            export: true,
            name: convertContext.escapeDeclarationText(name),
            type: createTypeNode(),
          }),
        });
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
        name: convertContext.escapeDeclarationText(name),
        value: factory.TypeAliasDeclaration.create({
          export: true,
          name: convertContext.escapeDeclarationText(name),
          comment: reference.data.description,
          type: factory.TypeReferenceNode.create({
            name: convertContext.escapeReferenceDeclarationText(context.resolveReferencePath(currentPoint, reference.path).name),
          }),
        }),
      });
    }
    const path = `${basePath}/${name}`;
    if (typeof targetSchema === "boolean") {
      // OpenAPI 3.1 で components.schemas に JSON Schema の boolean schema が利用可能になりました。
      return store.addStatement(
        path,
        {
          kind: "typeAlias",
          name: convertContext.escapeDeclarationText(name),
          value: factory.TypeAliasDeclaration.create({
            export: true,
            name: convertContext.escapeDeclarationText(name),
            type: ToTypeNode.convert(entryPoint, currentPoint, factory, targetSchema, context, convertContext),
          }),
        },
        { override: true },
      );
    }
    const schema = InferredType.getInferredType(targetSchema);
    if (!schema) {
      // Outputs Warning because Schema cannot be identified
      Logger.warn(`Warning: Schema could not be identified. Therefore, it is treated as any. ${name}`);
      return store.addStatement(
        path,
        {
          kind: "typeAlias",
          name: convertContext.escapeDeclarationText(name),
          value: Schema.generateNotInferedTypeAlias(entryPoint, currentPoint, factory, name, targetSchema, convertContext),
        },
        { override: true },
      );
    }
    if (Guard.isTypeArraySchema(schema)) {
      return store.addStatement(
        path,
        {
          kind: "typeAlias",
          name: convertContext.escapeDeclarationText(name),
          value: Schema.generateTypeAliasForTypeArray(entryPoint, currentPoint, factory, name, schema, context, convertContext),
        },
        { override: true },
      );
    }
    if (Guard.isAllOfSchema(schema)) {
      return store.addStatement(
        path,
        {
          kind: "typeAlias",
          name: convertContext.escapeDeclarationText(name),
          value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.allOf, context, "allOf", convertContext, schema),
        },
        { override: true },
      );
    }
    if (Guard.isOneOfSchema(schema)) {
      return store.addStatement(
        path,
        {
          kind: "typeAlias",
          name: convertContext.escapeDeclarationText(name),
          value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.oneOf, context, "oneOf", convertContext, schema),
        },
        { override: true },
      );
    }
    if (Guard.isAnyOfSchema(schema)) {
      return store.addStatement(
        path,
        {
          kind: "typeAlias",
          name: convertContext.escapeDeclarationText(name),
          value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.anyOf, context, "anyOf", convertContext, schema),
        },
        { override: true },
      );
    }
    if (Guard.isArraySchema(schema)) {
      return store.addStatement(
        path,
        {
          kind: "typeAlias",
          name: convertContext.escapeDeclarationText(name),
          value: Schema.generateArrayTypeAlias(entryPoint, currentPoint, factory, name, schema, context, convertContext),
        },
        { override: true },
      );
    }
    if (Guard.isObjectSchema(schema)) {
      if (schema.nullable) {
        return store.addStatement(
          path,
          {
            kind: "typeAlias",
            name: convertContext.escapeDeclarationText(name),
            value: Schema.generateTypeAliasDeclarationForObject(entryPoint, currentPoint, factory, name, schema, context, convertContext),
          },
          { override: true },
        );
      }
      return store.addStatement(
        path,
        {
          kind: "interface",
          name: convertContext.escapeDeclarationText(name),
          value: Schema.generateInterface(entryPoint, currentPoint, factory, name, schema, context, convertContext),
        },
        { override: true },
      );
    }
    if (Guard.isPrimitiveSchema(schema)) {
      return store.addStatement(
        path,
        {
          kind: "typeAlias",
          name,
          value: Schema.generateTypeAlias(entryPoint, currentPoint, factory, name, schema, convertContext),
        },
        { override: true },
      );
    }
    throw new UnSupportError(`schema.type = Array[] not supported. ${JSON.stringify(schema)}`);
  });
};
