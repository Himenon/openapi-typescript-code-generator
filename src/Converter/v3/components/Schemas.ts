import { FeatureDevelopmentError, UnSupportError } from "../../../Exception";
import { Factory } from "../../../TypeScriptCodeGenerator";
import * as Guard from "../Guard";
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
    type: "namespace",
    value: factory.Namespace.create({
      export: true,
      name: "Schemas",
      statements: [],
      comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#schemaObject`,
    }),
    statements: {},
  });
  Object.entries(schemas).forEach(([name, schema]) => {
    if (Guard.isReference(schema)) {
      const reference = Reference.generate<OpenApi.Schema>(entryPoint, currentPoint, schema);
      const path = reference.path;
      if (reference.type === "local") {
        throw new FeatureDevelopmentError("これから" + reference.name);
      }
      if (Guard.isAllOfSchema(reference.data)) {
        store.addStatement(path, {
          type: "typeAlias",
          value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, reference.name, reference.data.allOf, context, "allOf"),
        });
      } else if (Guard.isOneOfSchema(reference.data)) {
        store.addStatement(path, {
          type: "typeAlias",
          value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, reference.name, reference.data.oneOf, context, "oneOf"),
        });
      } else if (Guard.isAnyOfSchema(reference.data)) {
        store.addStatement(path, {
          type: "typeAlias",
          value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, reference.name, reference.data.anyOf, context, "allOf"),
        });
      } else if (Guard.isObjectSchema(reference.data)) {
        store.addStatement(path, {
          type: "interface",
          value: Schema.generateInterface(entryPoint, reference.referencePoint, factory, reference.name, reference.data, context),
        });
      } else if (Guard.isPrimitiveSchema(reference.data)) {
        store.addStatement(path, {
          type: "typeAlias",
          value: Schema.generateTypeAlias(entryPoint, reference.referencePoint, factory, reference.name, reference.data),
        });
      }
      if (store.hasStatement(`${basePath}/${name}`, ["interface", "typeAlias"])) {
        return;
      }
      return store.addStatement(`${basePath}/${name}`, {
        type: "typeAlias",
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
        value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.allOf, context, "allOf"),
      });
    }
    if (Guard.isOneOfSchema(schema)) {
      return store.addStatement(path, {
        type: "typeAlias",
        value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.oneOf, context, "oneOf"),
      });
    }
    if (Guard.isAnyOfSchema(schema)) {
      return store.addStatement(path, {
        type: "typeAlias",
        value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.anyOf, context, "anyOf"),
      });
    }
    if (Guard.isObjectSchema(schema)) {
      return store.addStatement(path, {
        type: "interface",
        value: Schema.generateInterface(entryPoint, currentPoint, factory, name, schema, context),
      });
    }
    if (Guard.isObjectSchema(schema)) {
      return store.addStatement(path, {
        type: "interface",
        value: Schema.generateInterface(entryPoint, currentPoint, factory, name, schema, context),
      });
    }
    if (Guard.isPrimitiveSchema(schema)) {
      return store.addStatement(path, {
        type: "typeAlias",
        value: Schema.generateTypeAlias(entryPoint, currentPoint, factory, name, schema),
      });
    }
    throw new UnSupportError("schema.type = Array[] not supported. " + JSON.stringify(schema));
  });
};
