import type { OpenApi } from "../../types";
import * as Logger from "../Logger";
import type { Factory } from "../TsGenerator";
import type * as ConverterContext from "./ConverterContext";
import * as Reference from "./components/Reference";
import * as Guard from "./Guard";
import * as InferredType from "./InferredType";
import type { ObjectSchemaWithAdditionalProperties } from "./types";

export interface ResolveReferencePath {
  name: string;
  maybeResolvedName: string;
  unresolvedPaths: string[];
  /**
   * @example components.a.b.c.dの場合 ["a", "b", "c", "d"].length = 4
   **/
  depth: number;
  /**
   * Input $ref divided by / (except #)
   */
  pathArray: string[];
}

export interface Context {
  readonly rootSchema: OpenApi.Document;
  setReferenceHandler: (currentPoint: string, reference: Reference.Type<OpenApi.Schema | OpenApi.JSONSchemaDefinition>) => void;
  resolveReferencePath: (currentPoint: string, referencePath: string) => ResolveReferencePath;
  findSchemaByPathArray: (currentPoint: string, paths: string[]) => OpenApi.Schema | OpenApi.Reference | OpenApi.JSONSchemaDefinition;
}

export type Convert = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schema: OpenApi.Schema | OpenApi.Reference | OpenApi.JSONSchemaDefinition,
  setReference: Context,
  convertContext: ConverterContext.Types,
  option?: Option,
) => string;

export interface Option {
  parent?: any;
  schemaRoot?: OpenApi.Schema;
}

const isSingleElementUnionOrIntersection = (schema: OpenApi.JSONSchemaDefinition | OpenApi.Reference): boolean => {
  if (typeof schema === "boolean" || Guard.isReference(schema)) return false;
  const s = schema as OpenApi.Schema;
  if (Guard.isOneOfSchema(s)) return s.oneOf.length === 1;
  if (Guard.isAllOfSchema(s)) return s.allOf.length === 1;
  if (Guard.isAnyOfSchema(s)) return s.anyOf.length === 1;
  if (s.enum && s.enum.length === 1) {
    const effectiveType = s.type ?? "string";
    if (effectiveType === "string" && Guard.isStringArray(s.enum)) return true;
    if ((effectiveType === "number" || effectiveType === "integer") && Guard.isNumberArray(s.enum)) return true;
    if (effectiveType === "boolean" && Guard.isBooleanArray(s.enum)) return true;
  }
  return false;
};

const wrapIfNeeded = (converted: string, schema: OpenApi.JSONSchemaDefinition | OpenApi.Reference): string => {
  if (isSingleElementUnionOrIntersection(schema) && !converted.startsWith("(")) {
    return `(${converted})`;
  }
  return converted;
};

export const generateMultiTypeNode = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schemas: OpenApi.JSONSchemaDefinition[],
  setReference: Context,
  convert: Convert,
  convertContext: ConverterContext.Types,
  multiType: "oneOf" | "allOf" | "anyOf",
  schemaRoot?: OpenApi.Schema,
): string => {
  const typeNodes = schemas.map(schema =>
    wrapIfNeeded(convert(entryPoint, currentPoint, factory, schema, setReference, convertContext, { schemaRoot }), schema),
  );
  if (multiType === "oneOf") {
    return factory.UnionTypeNode.create({
      typeNodes,
    });
  }
  if (multiType === "allOf") {
    return factory.IntersectionTypeNode.create({
      typeNodes,
    });
  }
  /**
   * If you see this comment and have an idea for an AnyOf type output, please submit an Issue.
   */
  return factory.UnionTypeNode.create({
    typeNodes,
  });
};

const nullable = (factory: Factory.Type, typeNode: string, isNullable: boolean): string => {
  if (isNullable) {
    return factory.UnionTypeNode.create({
      typeNodes: [
        typeNode,
        factory.TypeNode.create({
          type: "null",
        }),
      ],
    });
  }
  return typeNode;
};

const resolveJsonPointer = (root: any, reference: string): any => {
  if (!root || !reference.startsWith("#/")) {
    return undefined;
  }
  return reference
    .slice(2)
    .split("/")
    .reduce((current, token) => {
      if (current === null || typeof current !== "object") {
        return undefined;
      }
      return current[token.replace(/~1/g, "/").replace(/~0/g, "~")];
    }, root);
};

const isLiteralValue = (value: unknown): value is string | boolean | number | null => {
  return value === null || typeof value === "string" || typeof value === "boolean" || typeof value === "number";
};

const isEnumValueForType = (value: unknown, type: OpenApi.JSONSchemaTypeName): boolean => {
  if (type === "null") {
    return value === null;
  }
  if (type === "integer" || type === "number") {
    return typeof value === "number";
  }
  return typeof value === type;
};

/** OpenAPI 3.1 で追加された JSON Schema の const を TypeScript のリテラル型へ変換します。 */
export const generateLiteralTypeNode = (factory: Factory.Type, value: unknown): string | undefined => {
  return isLiteralValue(value) ? factory.LiteralTypeNode.create({ value }) : undefined;
};

const convertArrayItems = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schemas: OpenApi.JSONSchemaDefinition[],
  context: Context,
  convertContext: ConverterContext.Types,
  convert: Convert,
  schemaRoot?: OpenApi.Schema,
): string[] => {
  return schemas.map(schema => convert(entryPoint, currentPoint, factory, schema, context, convertContext, { schemaRoot }));
};

const convertTupleType = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schema: OpenApi.Schema,
  context: Context,
  convertContext: ConverterContext.Types,
  convert: Convert,
  schemaRoot?: OpenApi.Schema,
): string => {
  // OpenAPI 3.1 で追加された prefixItems は JSON Schema のタプルを表します。
  const prefixItems = schema.prefixItems || (Array.isArray(schema.items) ? schema.items : []);
  const items = convertArrayItems(entryPoint, currentPoint, factory, prefixItems, context, convertContext, convert, schemaRoot);
  const restSchema = Array.isArray(schema.items) ? schema.additionalItems : schema.items;
  if (restSchema !== false) {
    const restType =
      restSchema === undefined || restSchema === true
        ? factory.TypeNode.create({ type: "any" })
        : convert(entryPoint, currentPoint, factory, restSchema, context, convertContext, { parent: schema, schemaRoot });
    const wrappedRestType = hasTopLevelTypeOperator(restType) ? `(${restType})` : restType;
    items.push(`...${wrappedRestType}[]`);
  }
  return `[${items.join(", ")}]`;
};

const hasTopLevelTypeOperator = (typeNode: string): boolean => {
  let depth = 0;
  for (const character of typeNode) {
    if (character === "(" || character === "[" || character === "{") depth++;
    if (character === ")" || character === "]" || character === "}") depth--;
    if (depth === 0 && (character === "|" || character === "&")) return true;
  }
  return false;
};

export const convert: Convert = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schema: OpenApi.Schema | OpenApi.Reference | OpenApi.JSONSchemaDefinition,
  context: Context,
  converterContext: ConverterContext.Types,
  option?: Option,
): string => {
  if (typeof schema === "boolean") {
    // OpenAPI 3.1 で JSON Schema の boolean schema が利用可能になりました。
    return factory.TypeNode.create({
      type: schema ? "any" : "never",
    });
  }
  if (Guard.isReference(schema)) {
    const referenceSchemaRoot = option?.schemaRoot;
    if (!Reference.generateLocalReference(schema) && schema.$ref.startsWith("#/")) {
      const resolved =
        resolveJsonPointer(referenceSchemaRoot || context.rootSchema, schema.$ref) ?? resolveJsonPointer(context.rootSchema, schema.$ref);
      if (resolved !== undefined) {
        // OpenAPI 3.1 で JSON Schema のローカルな $defs 参照を解決します。
        const siblings = Object.fromEntries(Object.entries(schema).filter(([key]) => key !== "$ref"));
        const resolvedSchema = typeof resolved === "boolean" || Object.keys(siblings).length === 0 ? resolved : { ...resolved, ...siblings };
        return convert(entryPoint, currentPoint, factory, resolvedSchema, context, converterContext, {
          parent: schema,
          schemaRoot: referenceSchemaRoot,
        });
      }
    }
    const reference = Reference.generate<OpenApi.Schema | OpenApi.JSONSchemaDefinition>(entryPoint, currentPoint, schema);
    if (reference.type === "local") {
      // Type Aliasを作成 (or すでにある場合は作成しない)
      context.setReferenceHandler(currentPoint, reference);
      const { maybeResolvedName, depth } = context.resolveReferencePath(currentPoint, reference.path);
      const functionalSiblings = Object.entries(schema).filter(([key]) => key !== "$ref" && key !== "summary" && key !== "description");
      if (depth === 2 && functionalSiblings.length === 0) {
        return factory.TypeReferenceNode.create({ name: converterContext.escapeReferenceDeclarationText(maybeResolvedName) });
      }
      const resolvedSchema = context.findSchemaByPathArray(currentPoint, reference.path.split("/"));
      const resolveSchema =
        functionalSiblings.length === 0 || typeof resolvedSchema === "boolean"
          ? resolvedSchema
          : { ...resolvedSchema, ...Object.fromEntries(functionalSiblings) };
      return convert(entryPoint, currentPoint, factory, resolveSchema, context, converterContext, {
        parent: schema,
        schemaRoot: referenceSchemaRoot,
      });
    }
    // サポートしているディレクトリに対して存在する場合
    if (reference.componentName) {
      // Type AliasもしくはInterfaceを作成
      context.setReferenceHandler(currentPoint, reference);
      // Aliasを貼る
      return factory.TypeReferenceNode.create({ name: context.resolveReferencePath(currentPoint, reference.path).name });
    }
    // サポートしていないディレクトリに存在する場合、直接Interface、もしくはTypeAliasを作成
    return convert(entryPoint, reference.referencePoint, factory, reference.data, context, converterContext, {
      parent: schema,
      schemaRoot: referenceSchemaRoot,
    });
  }

  const schemaRoot = option?.schemaRoot || schema;

  if (Guard.isOneOfSchema(schema)) {
    return nullable(
      factory,
      generateMultiTypeNode(entryPoint, currentPoint, factory, schema.oneOf, context, convert, converterContext, "oneOf", schemaRoot),
      !!schema.nullable,
    );
  }
  if (Guard.isAllOfSchema(schema)) {
    return nullable(
      factory,
      generateMultiTypeNode(entryPoint, currentPoint, factory, schema.allOf, context, convert, converterContext, "allOf", schemaRoot),
      !!schema.nullable,
    );
  }
  if (Guard.isAnyOfSchema(schema)) {
    return nullable(
      factory,
      generateMultiTypeNode(entryPoint, currentPoint, factory, schema.anyOf, context, convert, converterContext, "anyOf", schemaRoot),
      !!schema.nullable,
    );
  }

  // OpenAPI 3.1 で JSON Schema の const キーワードが利用可能になりました。
  const constTypeNode = generateLiteralTypeNode(factory, schema.const);
  if (Object.hasOwn(schema, "const") && constTypeNode) {
    return nullable(factory, constTypeNode, !!schema.nullable);
  }

  if (Guard.isHasNoMembersObject(schema)) {
    return factory.TypeNode.create({
      type: "object",
      value: [],
    });
  }

  // OpenAPI 3.1 では type に複数の JSON Schema 型を指定できます。
  if (Array.isArray(schema.type)) {
    const typeNodes = schema.type.map(type =>
      convert(
        entryPoint,
        currentPoint,
        factory,
        {
          ...schema,
          type,
          nullable: undefined,
          enum: schema.enum?.filter(value => isEnumValueForType(value, type)),
        },
        context,
        converterContext,
        {
          parent: schema,
          schemaRoot,
        },
      ),
    );
    return nullable(factory, factory.UnionTypeNode.create({ typeNodes }), !!schema.nullable);
  }

  // schema.type
  if (!schema.type) {
    const inferredSchema = InferredType.getInferredType(schema);
    if (inferredSchema) {
      return convert(entryPoint, currentPoint, factory, inferredSchema, context, converterContext, {
        parent: schema,
        schemaRoot,
      });
    }
    // typeを指定せずに、nullableのみを指定している場合に type object変換する
    if (typeof schema.nullable === "boolean") {
      const typeNode = factory.TypeNode.create({
        type: "any",
      });
      return nullable(factory, typeNode, schema.nullable);
    }
    if (option?.parent) {
      const message = [
        "Schema Type is not found and is converted to the type any. The parent Schema is as follows.",
        "",
        JSON.stringify(option.parent),
        "",
      ].join("\n");
      Logger.info(message);
    }
    return factory.TypeNode.create({
      type: "any",
    });
  }
  switch (schema.type) {
    case "boolean": {
      const items = schema.enum;
      let typeNode: string;
      if (items && Guard.isBooleanArray(items)) {
        typeNode = factory.TypeNode.create({
          type: schema.type,
          enum: items,
        });
      } else {
        typeNode = factory.TypeNode.create({
          type: schema.type,
        });
      }
      return nullable(factory, typeNode, !!schema.nullable);
    }
    case "null": {
      return factory.TypeNode.create({
        type: schema.type,
      });
    }
    case "integer":
    case "number": {
      const items = schema.enum;
      let typeNode: string;
      const formatTypeNode = converterContext.convertFormatTypeNode(schema);
      if (formatTypeNode) {
        return formatTypeNode;
      }
      if (items && Guard.isNumberArray(items)) {
        typeNode = factory.TypeNode.create({
          type: schema.type,
          enum: items,
        });
      } else {
        typeNode = factory.TypeNode.create({
          type: schema.type,
        });
      }
      return nullable(factory, typeNode, !!schema.nullable);
    }
    case "string": {
      const items = schema.enum;
      const formatTypeNode = converterContext.convertFormatTypeNode(schema);
      if (formatTypeNode) {
        return formatTypeNode;
      }
      let typeNode: string;
      if (items && Guard.isStringArray(items)) {
        typeNode = factory.TypeNode.create({
          type: schema.type,
          enum: items,
        });
      } else {
        typeNode = factory.TypeNode.create({
          type: schema.type,
        });
      }
      return nullable(factory, typeNode, !!schema.nullable);
    }
    case "array": {
      if (schema.prefixItems || Array.isArray(schema.items)) {
        return nullable(
          factory,
          convertTupleType(entryPoint, currentPoint, factory, schema, context, converterContext, convert, schemaRoot),
          !!schema.nullable,
        );
      }
      let itemValue: string;
      if (schema.items === true) {
        itemValue = factory.TypeNode.create({ type: "any" });
      } else if (schema.items === false) {
        itemValue = factory.TypeNode.create({ type: "never" });
      } else if (schema.items) {
        const itemsSchema = schema.items as OpenApi.Schema;
        const itemFormatType = converterContext.convertFormatTypeNode(itemsSchema);
        if (itemFormatType) {
          itemValue = `(${itemFormatType})`;
        } else {
          itemValue = wrapIfNeeded(
            convert(entryPoint, currentPoint, factory, schema.items, context, converterContext, {
              parent: schema,
              schemaRoot,
            }),
            schema.items as OpenApi.Schema,
          );
        }
      } else {
        itemValue = factory.TypeNode.create({ type: "any" });
      }
      const typeNode = factory.TypeNode.create({ type: schema.type, value: itemValue });
      return nullable(factory, typeNode, !!schema.nullable);
    }
    case "object": {
      const required: string[] = schema.required || [];
      // // https://swagger.io/docs/specification/data-models/dictionaries/#free-form
      if (schema.additionalProperties === true) {
        return factory.TypeNode.create({
          type: schema.type,
          value: [],
        });
      }

      const value: string[] = Object.entries(schema.properties || {}).map(([name, jsonSchema]) => {
        return factory.PropertySignature.create({
          readOnly: typeof jsonSchema !== "boolean" ? !!jsonSchema.readOnly : false,
          name: converterContext.escapePropertySignatureName(name),
          type: convert(entryPoint, currentPoint, factory, jsonSchema, context, converterContext, {
            parent: schema,
            schemaRoot,
          }),
          optional: !required.includes(name),
          comment: typeof jsonSchema !== "boolean" ? jsonSchema.description : undefined,
        });
      });
      if (schema.additionalProperties) {
        const additionalProperties = factory.IndexSignatureDeclaration.create({
          name: "key",
          type: convert(entryPoint, currentPoint, factory, schema.additionalProperties, context, converterContext, {
            parent: schema.properties,
            schemaRoot,
          }),
        });

        const hasOptionalProperty = Object.keys(schema.properties || {}).some(key => !required.includes(key));
        if (hasOptionalProperty) {
          const objectTypeNode = factory.TypeNode.create({
            type: schema.type,
            value: value,
          });
          const additionalObjectTypeNode = factory.TypeNode.create({
            type: schema.type,
            value: [additionalProperties],
          });
          return factory.IntersectionTypeNode.create({
            typeNodes: [objectTypeNode, additionalObjectTypeNode],
          });
        }
        return factory.TypeNode.create({
          type: schema.type,
          value: [...value, additionalProperties],
        });
      }
      const typeNode = factory.TypeNode.create({
        type: schema.type,
        value,
      });
      return nullable(factory, typeNode, !!schema.nullable);
    }
    default:
      return factory.TypeNode.create({
        type: "any",
      });
  }
};

export const convertAdditionalProperties = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  schema: ObjectSchemaWithAdditionalProperties,
  setReference: Context,
  convertContext: ConverterContext.Types,
): string => {
  // // https://swagger.io/docs/specification/data-models/dictionaries/#free-form
  if (schema.additionalProperties === true) {
    factory.TypeNode.create({
      type: schema.type,
      value: [],
    });
  }
  return factory.IndexSignatureDeclaration.create({
    name: "key",
    type: convert(entryPoint, currentPoint, factory, schema.additionalProperties, setReference, convertContext, {
      parent: schema.properties,
      schemaRoot: schema,
    }),
  });
};
