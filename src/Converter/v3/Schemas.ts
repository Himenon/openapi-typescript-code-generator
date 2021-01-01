import { OpenApi } from "./types";
import { Factory } from "../../TypeScriptCodeGenerator";
import { FeatureDevelopmentError, UnSupportError } from "../../Exception";
import * as Guard from "./Guard";
import * as Reference from "./Reference";
import * as Schema from "./Schema";
import { Store } from "./store";
import * as ToTypeNode from "./toTypeNode";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  schemas: OpenApi.MapLike<string, OpenApi.Schema | OpenApi.Reference>,
  context: ToTypeNode.Context,
): void => {
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
        return store.addStatement(path, {
          type: "typeAlias",
          value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, reference.data.allOf, context, "allOf"),
        });
      }
      if (Guard.isOneOfSchema(reference.data)) {
        return store.addStatement(path, {
          type: "typeAlias",
          value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, reference.data.oneOf, context, "oneOf"),
        });
      }
      if (Guard.isAnyOfSchema(reference.data)) {
        return store.addStatement(path, {
          type: "typeAlias",
          value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, reference.data.anyOf, context, "allOf"),
        });
      }
      if (Guard.isObjectSchema(reference.data)) {
        return store.addStatement(path, {
          type: "interface",
          value: Schema.generateInterface(entryPoint, reference.referencePoint, factory, name, reference.data, context),
        });
      }
      if (Guard.isPrimitiveSchema(reference.data)) {
        return store.addStatement(path, {
          type: "typeAlias",
          value: Schema.generateTypeAlias(entryPoint, reference.referencePoint, factory, name, reference.data),
        });
      }
      throw new UnSupportError("schema.type = Array[] not supported. " + JSON.stringify(reference.data));
    }
    const path = `components/schemas/${name}`;
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
