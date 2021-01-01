import { OpenApi } from "./types";
import { Factory } from "../../TypeScriptCodeGenerator";
import { FeatureDevelopmentError, UnSupportError } from "../../Exception";
import * as Guard from "./Guard";
import * as Reference from "./Reference";
import * as Schema from "./Schema";
import { Store } from "./store";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  schemas: OpenApi.MapLike<string, OpenApi.Schema | OpenApi.Reference>,
): void => {
  store.addComponent("schemas", {
    type: "namespace",
    value: factory.Namespace.create({
      export: true,
      name: "Components",
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
      // if (reference.componentName) {
      //   return store.addStatement(path, {
      //     type: "typeAlias",
      //     value: factory.TypeAliasDeclaration.createReference({
      //       export: true,
      //       name,
      //       referenceName: reference.name,
      //     }),
      //   });
      // }
      if (Guard.isAllOfSchema(reference.data)) {
        return store.addStatement(path, {
          type: "typeAlias",
          value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, reference.data.allOf, "allOf"),
        });
      }
      if (Guard.isOneOfSchema(reference.data)) {
        return store.addStatement(path, {
          type: "typeAlias",
          value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, reference.data.oneOf, "oneOf"),
        });
      }
      if (Guard.isAnyOfSchema(reference.data)) {
        return store.addStatement(path, {
          type: "typeAlias",
          value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, reference.data.anyOf, "allOf"),
        });
      }
      if (Guard.isObjectSchema(reference.data)) {
        return store.addStatement(path, {
          type: "interface",
          value: Schema.generateInterface(entryPoint, reference.referencePoint, factory, name, reference.data),
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
        value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.allOf, "allOf"),
      });
    }
    if (Guard.isOneOfSchema(schema)) {
      return store.addStatement(path, {
        type: "typeAlias",
        value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.oneOf, "oneOf"),
      });
    }
    if (Guard.isAnyOfSchema(schema)) {
      return store.addStatement(path, {
        type: "typeAlias",
        value: Schema.generateMultiTypeAlias(entryPoint, currentPoint, factory, name, schema.anyOf, "anyOf"),
      });
    }
    if (Guard.isObjectSchema(schema)) {
      return store.addStatement(path, {
        type: "interface",
        value: Schema.generateInterface(entryPoint, currentPoint, factory, name, schema),
      });
    }
    if (Guard.isObjectSchema(schema)) {
      return store.addStatement(path, {
        type: "interface",
        value: Schema.generateInterface(entryPoint, currentPoint, factory, name, schema),
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
