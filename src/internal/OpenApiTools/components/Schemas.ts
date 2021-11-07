import DotProp from "dot-prop";

import type { OpenApi } from "../../../types";
import * as Logger from "../..//Logger";
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
        const { maybeResolvedName, depth, pathArray } = context.resolveReferencePath(currentPoint, reference.path);
        const createTypeNode = () => {
          if (depth === 2) {
            return factory.TypeReferenceNode.create({
              name: convertContext.escapeReferenceDeclarationText(maybeResolvedName),
            });
          }
          const schema = DotProp.get(context.rootSchema, pathArray.join(".")) as any;
          return ToTypeNode.convert(entryPoint, currentPoint, factory, schema, context, convertContext, { parent: schema });
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
    const schema = InferredType.getInferredType(targetSchema);
    const path = `${basePath}/${name}`;
    if (!schema) {
      // Schemaが特定できないためWarningを出力する
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
    if (Guard.isAllOfSchema(schema)) {
      return store.addStatement(
        path,
        {
          kind: "typeAlias",
          name: convertContext.escapeDeclarationText(name),
          value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.allOf, context, "allOf", convertContext),
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
          value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.oneOf, context, "oneOf", convertContext),
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
          value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.anyOf, context, "anyOf", convertContext),
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
    if (Guard.isObjectSchema(schema)) {
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
    throw new UnSupportError("schema.type = Array[] not supported. " + JSON.stringify(schema));
  });
};
