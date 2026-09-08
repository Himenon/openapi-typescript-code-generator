import type { OpenApi } from "../../../types";
import type { Factory } from "../../TsGenerator";
import type * as ConverterContext from "../ConverterContext";
import * as Guard from "../Guard";
import * as ToTypeNode from "../toTypeNode";
import * as Reference from "./Reference";

export const generatePropertySignature = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  protocol: string,
  schema: OpenApi.JSONSchemaDefinition | OpenApi.Reference,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): string => {
  return factory.PropertySignature.create({
    readOnly: false,
    name: converterContext.escapePropertySignatureName(protocol),
    optional: false,
    type: ToTypeNode.convert(
      entryPoint,
      currentPoint,
      factory,
      schema,
      context,
      converterContext,
      typeof schema === "object" && !Guard.isReference(schema) ? { schemaRoot: schema } : undefined,
    ),
    comment: !Guard.isReference(schema) && typeof schema !== "boolean" ? schema.description : undefined,
  });
};

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  content: Record<string, OpenApi.MediaType | OpenApi.Reference>,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): string[] => {
  return Object.entries(content).reduce<string[]>((previous, [protocol, mediaType]) => {
    if (Guard.isReference(mediaType)) {
      const reference = Reference.generate<OpenApi.MediaType>(entryPoint, currentPoint, mediaType);
      if (reference.type === "local") {
        // OpenAPI 3.2 で追加された components.mediaTypes の参照を型参照として出力します。
        return previous.concat(
          factory.PropertySignature.create({
            readOnly: false,
            name: converterContext.escapePropertySignatureName(protocol),
            optional: false,
            type: factory.TypeReferenceNode.create({
              name: context.resolveReferencePath(currentPoint, reference.path).name,
            }),
          }),
        );
      }
      mediaType = reference.data;
    }
    // OpenAPI 3.2 で追加された itemSchema は、ストリーミング形式の各 item の型を表します。
    const schema = mediaType.schema ?? mediaType.itemSchema;
    if (schema === undefined) {
      return previous;
    }
    return previous.concat(generatePropertySignature(entryPoint, currentPoint, factory, protocol, schema, context, converterContext));
  }, []);
};

export const generateInterface = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  content: Record<string, OpenApi.MediaType | OpenApi.Reference>,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): string => {
  return factory.InterfaceDeclaration.create({
    export: true,
    name,
    members: generatePropertySignatures(entryPoint, currentPoint, factory, content, context, converterContext),
  });
};
