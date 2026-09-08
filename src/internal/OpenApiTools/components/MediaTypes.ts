import type { OpenApi } from "../../../types";
import type { Factory } from "../../TsGenerator";
import type * as ConverterContext from "../ConverterContext";
import * as Guard from "../Guard";
import * as Name from "../Name";
import * as ToTypeNode from "../toTypeNode";
import type * as Walker from "../Walker";
import * as Reference from "./Reference";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Walker.Store,
  factory: Factory.Type,
  mediaTypes: Record<string, OpenApi.MediaType | OpenApi.Reference>,
  context: ToTypeNode.Context,
  convertContext: ConverterContext.Types,
): void => {
  const basePath = "components/mediaTypes";
  store.addComponent("mediaTypes", {
    kind: "namespace",
    name: Name.Components.MediaTypes,
  });

  Object.entries(mediaTypes).forEach(([name, mediaType]) => {
    let targetMediaType: OpenApi.MediaType | undefined;
    if (Guard.isReference(mediaType)) {
      const reference = Reference.generate<OpenApi.MediaType>(entryPoint, currentPoint, mediaType);
      if (reference.type === "local") {
        const resolved = store.getMediaType(reference.path);
        if (!Guard.isReference(resolved) && typeof resolved !== "boolean") {
          targetMediaType = resolved as OpenApi.MediaType;
        }
      } else {
        targetMediaType = reference.data;
      }
    } else {
      targetMediaType = mediaType;
    }
    if (!targetMediaType) {
      return;
    }

    // OpenAPI 3.2 で再利用可能な Media Type が追加されました。
    const schema = targetMediaType.schema ?? targetMediaType.itemSchema;
    const type =
      schema !== undefined
        ? ToTypeNode.convert(entryPoint, currentPoint, factory, schema, context, convertContext)
        : factory.TypeNode.create({ type: "any" });
    store.addStatement(`${basePath}/${name}`, {
      kind: "typeAlias",
      name: convertContext.escapeDeclarationText(name),
      value: factory.TypeAliasDeclaration.create({
        export: true,
        name: convertContext.escapeDeclarationText(name),
        type,
        comment: targetMediaType.description,
      }),
    });
  });
};
