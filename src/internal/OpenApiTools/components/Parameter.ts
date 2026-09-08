import type { OpenApi } from "../../../types";
import type { Factory } from "../../TsGenerator";
import type * as ConverterContext from "../ConverterContext";
import * as Guard from "../Guard";
import * as ToTypeNode from "../toTypeNode";
import type * as Walker from "../Walker";
import * as Reference from "./Reference";

const getParameterSchema = (parameter: OpenApi.Parameter): OpenApi.JSONSchemaDefinition | OpenApi.Reference | undefined => {
  if (parameter.schema !== undefined) {
    return parameter.schema;
  }
  // OpenAPI 3.2 で querystring パラメータの content によるスキーマ指定を扱います。
  const mediaType = Object.values(parameter.content || {})[0];
  if (Guard.isReference(mediaType)) {
    return mediaType;
  }
  return mediaType?.schema ?? mediaType?.itemSchema;
};

const generateParameterTypeNode = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  parameter: OpenApi.Parameter,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): string => {
  const schema = getParameterSchema(parameter) ?? { type: "null" };
  return ToTypeNode.convert(
    entryPoint,
    currentPoint,
    factory,
    schema,
    context,
    converterContext,
    typeof schema === "object" && !Guard.isReference(schema) ? { schemaRoot: schema } : undefined,
  );
};

export const generateTypeNode = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  parameter: OpenApi.Parameter,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): string => {
  return generateParameterTypeNode(entryPoint, currentPoint, factory, parameter, context, converterContext);
};

export const generateTypeAlias = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  parameter: OpenApi.Parameter,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): string => {
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: converterContext.escapeDeclarationText(name),
    comment: parameter.description,
    type: generateTypeNode(entryPoint, currentPoint, factory, parameter, context, converterContext),
  });
};

export const generatePropertySignatureObject = (
  entryPoint: string,
  currentPoint: string,
  store: Walker.Store,
  factory: Factory.Type,
  parameter: OpenApi.Parameter | OpenApi.Reference,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): { name: string; typeElement: string } => {
  if (Guard.isReference(parameter)) {
    const reference = Reference.generate<OpenApi.Parameter>(entryPoint, currentPoint, parameter);
    if (reference.type === "local") {
      context.setReferenceHandler(currentPoint, reference);
      const localRef = store.getParameter(reference.path);
      const isPathProperty = localRef.in === "path";
      const name = converterContext.escapePropertySignatureName(localRef.name);
      const typeElement = factory.PropertySignature.create({
        readOnly: false,
        name: name,
        optional: isPathProperty ? false : !localRef.required,
        comment: localRef.description,
        type: factory.TypeReferenceNode.create({
          name: context.resolveReferencePath(currentPoint, reference.path).name,
        }),
      });
      return {
        name,
        typeElement: typeElement,
      };
    }
    const isPathProperty = reference.data.in === "path";
    const name = converterContext.escapePropertySignatureName(reference.data.name);
    const typeElement = factory.PropertySignature.create({
      readOnly: false,
      name: name,
      optional: isPathProperty ? false : !reference.data.required,
      comment: reference.data.description,
      type: generateParameterTypeNode(entryPoint, reference.referencePoint, factory, reference.data, context, converterContext),
    });
    return {
      name,
      typeElement: typeElement,
    };
  }
  const isPathProperty = parameter.in === "path";
  const name = converterContext.escapePropertySignatureName(parameter.name);
  const typeElement = factory.PropertySignature.create({
    readOnly: false,
    name: name,
    optional: isPathProperty ? false : !parameter.required,
    type: generateTypeNode(entryPoint, currentPoint, factory, parameter, context, converterContext),
    comment: parameter.description,
  });
  return {
    name,
    typeElement: typeElement,
  };
};

/**
 * パラメータの `in` プロパティを返す。
 *
 * inline パラメータはそのまま `in` を返す。
 * `$ref` 参照の場合はローカル参照を解決して store から実体を取得する。
 * store に存在しない場合（リモート参照など）は `undefined` を返す。
 */
const resolveParameterIn = (store: Walker.Store, parameter: OpenApi.Parameter | OpenApi.Reference): string | undefined => {
  if (!Guard.isReference(parameter)) {
    return parameter.in;
  }
  const localRef = Reference.generateLocalReference(parameter);
  if (!localRef) {
    return undefined;
  }
  try {
    return store.getParameter(localRef.path).in;
  } catch {
    return undefined;
  }
};

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  store: Walker.Store,
  factory: Factory.Type,
  parameters: (OpenApi.Parameter | OpenApi.Reference)[],
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): string[] => {
  // 入力順を維持しながら、同名パラメータが存在する場合は path パラメータを優先する。
  // Map はキーの挿入順を保持するため、既存キーへの set() は値のみ更新し順序は変わらない。
  // これにより OpenAPI spec の記述順を崩さず、path パラメータの required が保たれる。
  const typeElementMap = new Map<string, string>();
  for (const parameter of parameters) {
    const { name, typeElement } = generatePropertySignatureObject(
      entryPoint,
      currentPoint,
      store,
      factory,
      parameter,
      context,
      converterContext,
    );
    const isPath = resolveParameterIn(store, parameter) === "path";
    if (!typeElementMap.has(name) || isPath) {
      typeElementMap.set(name, typeElement);
    }
  }
  return [...typeElementMap.values()];
};

export const generateInterface = (
  entryPoint: string,
  currentPoint: string,
  store: Walker.Store,
  factory: Factory.Type,
  name: string,
  parameters: (OpenApi.Parameter | OpenApi.Reference)[],
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): string => {
  return factory.InterfaceDeclaration.create({
    export: true,
    name,
    members: generatePropertySignatures(entryPoint, currentPoint, store, factory, parameters, context, converterContext),
  });
};

/**
 * Alias作成用
 */
export const generateAliasInterface = (
  entryPoint: string,
  currentPoint: string,
  store: Walker.Store,
  factory: Factory.Type,
  name: string,
  parameters: (OpenApi.Parameter | OpenApi.Reference)[],
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): string => {
  return factory.InterfaceDeclaration.create({
    export: true,
    name: converterContext.escapeDeclarationText(name),
    members: generatePropertySignatures(entryPoint, currentPoint, store, factory, parameters, context, converterContext),
  });
};
