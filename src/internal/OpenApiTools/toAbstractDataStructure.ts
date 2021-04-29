import type { OpenApi } from "../../types";
import { UnsetTypeError } from "../Exception";
import { UnSupportError } from "../Exception";
import type * as Intermediate from "../AbstractDataStructure";
import * as Logger from "../Logger";
import { Factory } from "../TsGenerator";
import * as Reference from "./components/Reference";
import * as ConverterContext from "./ConverterContext";
import * as Guard from "./Guard";
import * as InferredType from "./InferredType";
import { ObjectSchemaWithAdditionalProperties } from "./types";

export interface ResolveReferencePath {
  name: string;
  maybeResolvedName: string;
  unresolvedPaths: string[];
}

export interface Context {
  setReferenceHandler: (currentPoint: string, reference: Reference.Type<OpenApi.Schema | OpenApi.JSONSchemaDefinition>) => void;
  resolveReferencePath: (currentPoint: string, referencePath: string) => ResolveReferencePath;
}

export type Convert = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schema: OpenApi.Schema | OpenApi.Reference | OpenApi.JSONSchemaDefinition,
  setReference: Context,
  convertContext: ConverterContext.Types,
  option?: Option,
) => Intermediate.Type;

export interface Option {
  parent?: any;
}

export const generateMultiTypeNode = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schemas: OpenApi.JSONSchema[],
  setReference: Context,
  convert: Convert,
  convertContext: ConverterContext.Types,
  multiType: "oneOf" | "allOf" | "anyOf",
): Intermediate.Type => {
  const value = schemas.map(schema => convert(entryPoint, currentPoint, factory, schema, setReference, convertContext));
  if (multiType === "oneOf") {
    return {
      kind: "union",
      schemaTypes: value,
    };
  }
  if (multiType === "allOf") {
    return {
      kind: "intersection",
      schemaTypes: value,
    };
  }
  // TODO Feature Development: Calculate intersection types
  return {
    kind: "never",
  };
};

const nullable = (factory: Factory.Type, schemaType: Intermediate.Type, nullable: boolean): Intermediate.Type => {
  if (nullable) {
    return {
      kind: "union",
      schemaTypes: [
        schemaType,
        {
          kind: "null",
        },
      ],
    };
  }
  return schemaType;
};

export const convert: Convert = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schema: OpenApi.Schema | OpenApi.Reference | OpenApi.JSONSchemaDefinition,
  context: Context,
  converterContext: ConverterContext.Types,
  option?: Option,
): Intermediate.Type => {
  if (typeof schema === "boolean") {
    // https://swagger.io/docs/specification/data-models/dictionaries/#free-form
    return {
      kind: "object",
      properties: [],
    };
  }
  if (Guard.isReference(schema)) {
    const reference = Reference.generate<OpenApi.Schema | OpenApi.JSONSchemaDefinition>(entryPoint, currentPoint, schema);
    if (reference.type === "local") {
      // Type Aliasを作成 (or すでにある場合は作成しない)
      context.setReferenceHandler(currentPoint, reference);
      const { maybeResolvedName } = context.resolveReferencePath(currentPoint, reference.path);
      return {
        kind: "reference",
        name: converterContext.escapeDeclarationText(maybeResolvedName),
      };
    }
    // サポートしているディレクトリに対して存在する場合
    if (reference.componentName) {
      // Type AliasもしくはInterfaceを作成
      context.setReferenceHandler(currentPoint, reference);
      // Aliasを貼る
      return {
        kind: "reference",
        name: context.resolveReferencePath(currentPoint, reference.path).name,
      };
    }
    // サポートしていないディレクトリに存在する場合、直接Interface、もしくはTypeAliasを作成
    return convert(entryPoint, reference.referencePoint, factory, reference.data, context, converterContext, { parent: schema });
  }

  if (Guard.isOneOfSchema(schema)) {
    return generateMultiTypeNode(entryPoint, currentPoint, factory, schema.oneOf, context, convert, converterContext, "oneOf");
  }
  if (Guard.isAllOfSchema(schema)) {
    return generateMultiTypeNode(entryPoint, currentPoint, factory, schema.allOf, context, convert, converterContext, "allOf");
  }
  if (Guard.isAnyOfSchema(schema)) {
    return generateMultiTypeNode(entryPoint, currentPoint, factory, schema.anyOf, context, convert, converterContext, "anyOf");
  }

  if (Guard.isHasNoMembersObject(schema)) {
    return {
      kind: "object",
      properties: [],
    };
  }

  // schema.type
  if (!schema.type) {
    const inferredSchema = InferredType.getInferredType(schema);
    if (inferredSchema) {
      return convert(entryPoint, currentPoint, factory, inferredSchema, context, converterContext, { parent: schema });
    }
    // typeを指定せずに、nullableのみを指定している場合に type object変換する
    if (typeof schema.nullable === "boolean") {
      return nullable(factory, { kind: "any" }, schema.nullable);
    }
    if (option && option.parent) {
      Logger.info("Parent Schema:");
      Logger.info(JSON.stringify(option.parent));
    }
    Logger.showFilePosition(entryPoint, currentPoint);
    throw new UnsetTypeError("Please set 'type' or '$ref' property \n" + JSON.stringify(schema));
  }
  switch (schema.type) {
    case "boolean": {
      return nullable(factory, { kind: "boolean" }, !!schema.nullable);
    }
    case "null": {
      return {
        kind: "null",
      };
    }
    case "integer":
    case "number": {
      const items = schema.enum;
      let typeNode: Intermediate.Type;
      if (items && Guard.isNumberArray(items)) {
        typeNode = {
          kind: "number",
          enum: items,
        };
      } else {
        typeNode = {
          kind: "number",
        };
      }
      return nullable(factory, typeNode, !!schema.nullable);
    }
    case "string": {
      const items = schema.enum;
      let typeNode: Intermediate.Type;
      if (items && Guard.isStringArray(items)) {
        typeNode = {
          kind: "string",
          enum: items,
        };
      } else {
        typeNode = {
          kind: "string",
        };
      }
      return nullable(factory, typeNode, !!schema.nullable);
    }
    case "array": {
      if (Array.isArray(schema.items) || typeof schema.items === "boolean") {
        throw new UnSupportError(`schema.items = ${JSON.stringify(schema.items)}`);
      }
      const typeNode: Intermediate.Type = {
        kind: "array",
        schemaType: schema.items
          ? convert(entryPoint, currentPoint, factory, schema.items, context, converterContext, { parent: schema })
          : {
              kind: "undefined",
            },
      };
      return nullable(factory, typeNode, !!schema.nullable);
    }
    case "object": {
      const required: string[] = schema.required || [];
      // // https://swagger.io/docs/specification/data-models/dictionaries/#free-form
      if (schema.additionalProperties === true) {
        return {
          kind: "object",
          properties: [],
        };
      }
      const value: Intermediate.PropertySignatureStruct[] = Object.entries(schema.properties || {}).map(([name, jsonSchema]) => {
        return {
          kind: "PropertySignature",
          name: converterContext.escapePropertySignatureName(name),
          schemaType: convert(entryPoint, currentPoint, factory, jsonSchema, context, converterContext, { parent: schema.properties }),
          optional: !required.includes(name),
          comment: typeof jsonSchema !== "boolean" ? jsonSchema.description : undefined,
        };
      });
      if (schema.additionalProperties) {
        const additionalProperties: Intermediate.IndexSignatureStruct = {
          kind: "IndexSignature",
          name: "key",
          schemaType: convert(entryPoint, currentPoint, factory, schema.additionalProperties, context, converterContext, {
            parent: schema.properties,
          }),
        };
        return {
          kind: "object",
          properties: [...value, additionalProperties],
        };
      }
      const typeNode: Intermediate.Type = {
        kind: "object",
        properties: value,
      };
      return nullable(factory, typeNode, !!schema.nullable);
    }
    default:
      return {
        kind: "any",
      };
    // throw new UnknownError("what is this? \n" + JSON.stringify(schema, null, 2));
  }
};

export const convertAdditionalProperties = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schema: ObjectSchemaWithAdditionalProperties,
  setReference: Context,
  convertContext: ConverterContext.Types,
): Intermediate.IndexSignatureStruct => {
  // // https://swagger.io/docs/specification/data-models/dictionaries/#free-form
  if (schema.additionalProperties === true) {
    factory.TypeNode.create({
      type: schema.type,
      value: [],
    });
  }
  const additionalProperties: Intermediate.IndexSignatureStruct = {
    kind: "IndexSignature",
    name: "key",
    schemaType: convert(entryPoint, currentPoint, factory, schema.additionalProperties, setReference, convertContext, {
      parent: schema.properties,
    }),
  };
  return additionalProperties;
};
