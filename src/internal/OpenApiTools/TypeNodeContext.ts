import * as Path from "node:path";
import * as DotProp from "dot-prop";

import type { OpenApi } from "../../types";
import { DevelopmentError } from "../Exception";
import { FileSystem } from "../FileSystem";
import type * as TypeScriptCodeGenerator from "../TsGenerator";
import type * as ConverterContext from "./ConverterContext";
import * as Reference from "./components/Reference";
import * as Schema from "./components/Schema";
import * as Guard from "./Guard";
import * as ToTypeNode from "./toTypeNode";
import type { ObjectSchema } from "./types";
import type * as Walker from "./Walker";

export interface ReferencePathSet {
  pathArray: string[];
  base: string;
}

/**
 * エントリポイント、現在のファイルパス、参照パスから、相対的なパスの配列とベースディレクトリを生成します。
 *
 * @param entryPoint - OpenAPI定義のエントリポイント（例: "openapi.yml"）
 * @param currentPoint - 現在処理中のファイルパス（例: "components/schemas/A.yml"）
 * @param referencePath - 参照先のパス（例: "components/schemas/B.yml"）
 * @returns パスの配列とベースディレクトリのセット
 *
 * @example
 * generatePath("openapi.yml", "components/schemas/User.yml", "components/schemas/Common.yml")
 * // 返り値の例: { pathArray: ["Common"], base: "components/schemas" }
 */
export const generatePath = (entryPoint: string, currentPoint: string, referencePath: string): ReferencePathSet => {
  // JSON Pointerのフラグメントはドキュメント内の位置を示すため、ファイルシステム上の相対パス計算には影響させない。
  const documentEntryPoint = Reference.getDocumentPoint(entryPoint);
  const documentCurrentPoint = Reference.getDocumentPoint(currentPoint);
  const ext = Path.extname(documentCurrentPoint); // .yml
  const from = Path.relative(Path.dirname(documentEntryPoint), documentCurrentPoint).replace(ext, ""); // components/schemas/A/B
  const base = Path.dirname(from).replace(Path.sep, "/");
  const result = Path.posix.relative(base, referencePath); // remoteの場合? localの場合 referencePath.split("/")
  const pathArray = result.split("/");
  return {
    pathArray,
    base,
  };
};

/**
 * store を参照して、参照先のパスから TypeScript の型名や名前空間の階層を計算します。
 *
 * @param store - 型定義の情報を保持するストア
 * @param base - 探索のベースディレクトリ
 * @param pathArray - 探索対象のパス配列
 * @param converterContext - 変換コンテキスト
 * @returns 解決された型名や未解決のパス、階層の深さなどの情報
 */
export const calculateReferencePath = (
  store: Walker.Store,
  base: string,
  pathArray: string[],
  converterContext: ConverterContext.Types,
): ToTypeNode.ResolveReferencePath => {
  let names: string[] = [];
  let unresolvedPaths: string[] = [];
  pathArray.reduce((previous, lastPath, index) => {
    const current = Path.posix.join(previous, lastPath);
    // ディレクトリが深い場合は相対パスが`..`を繰り返す可能性があり、
    // その場合はすでに登録されたnamesを削除する
    if (lastPath === ".." && names.length > 0) {
      names = names.slice(0, names.length - 1);
    }
    const isFinalPath = index === pathArray.length - 1;
    if (isFinalPath) {
      const statement = store.getStatement(current, "interface");
      const statement2 = store.getStatement(current, "typeAlias");
      const statement3 = store.getStatement(current, "namespace");
      if (statement) {
        names.push(statement.name);
        return current;
      }
      if (statement2) {
        names.push(statement2.name);
        return current;
      }
      if (statement3) {
        names.push(statement3.name);
        return current;
      }
      unresolvedPaths.push(lastPath);
    } else {
      const statement = store.getStatement(current, "namespace");
      if (statement) {
        unresolvedPaths = unresolvedPaths.slice(0, unresolvedPaths.length - 1);
        names.push(statement.name);
      } else {
        unresolvedPaths.push(lastPath);
      }
    }
    return current;
  }, base);
  if (names.length === 0) {
    throw new DevelopmentError(`Local Reference Error \n${JSON.stringify({ pathArray, names, base }, null, 2)}`);
  }
  const maybeResolvedNameFragments = names.concat(unresolvedPaths).map(converterContext.escapeDeclarationText);
  return {
    name: names.map(converterContext.escapeDeclarationText).join("."),
    maybeResolvedName: maybeResolvedNameFragments.join("."),
    unresolvedPaths,
    depth: maybeResolvedNameFragments.length,
    pathArray,
  };
};

export const create = (
  entryPoint: string,
  rootSchema: OpenApi.Document,
  store: Walker.Store,
  factory: TypeScriptCodeGenerator.Factory.Type,
  converterContext: ConverterContext.Types,
): ToTypeNode.Context => {
  const resolveReferencePath: ToTypeNode.Context["resolveReferencePath"] = (currentPoint, referencePath) => {
    const { pathArray, base } = generatePath(entryPoint, currentPoint, referencePath);
    return calculateReferencePath(store, base, pathArray, converterContext);
  };
  const findSchemaByPathArray = (
    currentPoint: string,
    pathArray: string[],
    visited: Set<string> = new Set(),
  ): OpenApi.Schema | OpenApi.Reference | OpenApi.JSONSchemaDefinition => {
    // 参照解決はドキュメント境界をまたぐ可能性があるため、エントリポイントではなく現在の参照を所有するドキュメントを基準に解決する。
    const documentPoint = Reference.getDocumentPoint(currentPoint);
    // スキーマが自身を参照する場合にコールスタックがあふれないよう、再帰済みの参照を追跡する。
    const visitKey = `${documentPoint}|${pathArray.join("/")}`;
    if (visited.has(visitKey)) {
      throw new DevelopmentError(`Circular schema reference \n${JSON.stringify({ currentPoint, pathArray }, null, 2)}`);
    }
    visited.add(visitKey);

    // エントリポイントは既に読み込み済みだが、リモートドキュメントは自身のファイルから読み込む。
    const isEntryPoint = Path.resolve(documentPoint) === Path.resolve(Reference.getDocumentPoint(entryPoint));
    const document = isEntryPoint ? rootSchema : FileSystem.loadJsonOrYaml(documentPoint);
    let schema: unknown = document;
    // パスを1要素ずつたどり、途中で参照が見つかった場合は参照先ドキュメントで残りのパスを解決する。
    for (const [index, path] of pathArray.entries()) {
      schema = DotProp.getProperty(schema, [path]);
      if (schema === undefined) {
        throw new DevelopmentError(
          `Schema not found \n${JSON.stringify({ currentPoint: documentPoint, pathArray, missingPath: pathArray.slice(0, index + 1) }, null, 2)}`,
        );
      }
      if (Guard.isReference(schema)) {
        // 参照をたどると解決対象のドキュメントが変わる可能性がある。
        const ref = Reference.generate(entryPoint, documentPoint, schema);
        const nextPoint = ref.type === "local" ? documentPoint : ref.referencePoint;
        return findSchemaByPathArray(nextPoint, [...ref.path.split("/"), ...pathArray.slice(index + 1)], visited);
      }
    }
    if (schema === document) {
      throw new DevelopmentError(`Schema path is empty \n${JSON.stringify({ currentPoint: documentPoint, pathArray }, null, 2)}`);
    }
    return schema as OpenApi.Schema | OpenApi.Reference | OpenApi.JSONSchemaDefinition;
  };
  const setReferenceHandler: ToTypeNode.Context["setReferenceHandler"] = (currentPoint, reference) => {
    if (store.hasStatement(reference.path, ["interface", "typeAlias"])) {
      return;
    }
    const context = { rootSchema, setReferenceHandler, resolveReferencePath, findSchemaByPathArray };
    if (reference.type === "remote") {
      const data = reference.data;
      // Determine if the schema should be treated as an interface equivalent
      // (e.g., plain object schemas that are not nullable and don't produce IntersectionTypeNode)
      const isInterfaceEquivalent = (() => {
        if (typeof data === "boolean") return true;
        if (Guard.isReference(data)) return false;
        if (Guard.isOneOfSchema(data) || Guard.isAllOfSchema(data) || Guard.isAnyOfSchema(data)) return false;
        if (Guard.isHasNoMembersObject(data)) return true;
        if (!Guard.isObjectSchema(data)) return false;
        if (data.nullable) return false;
        if (data.additionalProperties && typeof data.additionalProperties === "object") {
          const hasOptionalProp = Object.keys(data.properties || {}).some(key => !(data.required || []).includes(key));
          if (hasOptionalProp) return false;
        }
        return true;
      })();
      if (isInterfaceEquivalent) {
        let members: string[] = [];
        if (
          typeof data !== "boolean" &&
          !Guard.isReference(data) &&
          Guard.isObjectSchema(data) &&
          !Guard.isHasNoMembersObject(data) &&
          data.additionalProperties !== true
        ) {
          const objData = data as ObjectSchema;
          const propertySignatures = Schema.generatePropertySignatures(
            entryPoint,
            reference.referencePoint,
            factory,
            objData,
            context,
            converterContext,
          );
          if (Guard.isObjectSchemaWithAdditionalProperties(objData)) {
            const additionalProperties = ToTypeNode.convertAdditionalProperties(
              entryPoint,
              reference.referencePoint,
              factory,
              objData,
              context,
              converterContext,
            );
            members = [...propertySignatures, additionalProperties];
          } else {
            members = propertySignatures;
          }
        }
        store.addStatement(reference.path, {
          kind: "interface",
          name: reference.name,
          value: factory.InterfaceDeclaration.create({ export: true, name: reference.name, members }),
        });
      } else {
        const typeStr = ToTypeNode.convert(entryPoint, reference.referencePoint, factory, data, context, converterContext);
        const value = factory.TypeAliasDeclaration.create({
          export: true,
          name: converterContext.escapeDeclarationText(reference.name),
          type: typeStr,
        });
        store.addStatement(reference.path, { name: reference.name, kind: "typeAlias", value });
      }
    } else if (reference.type === "local") {
      // リモートドキュメント内のローカル参照は、エントリポイントのルートスキーマではなく、
      // そのリモートドキュメントを基準に解決する。
      const isExternalDocument =
        Path.resolve(Reference.getDocumentPoint(currentPoint)) !== Path.resolve(Reference.getDocumentPoint(entryPoint));
      if (isExternalDocument) {
        const schema = findSchemaByPathArray(currentPoint, reference.path.split("/"));
        const declarationName = Path.posix.basename(reference.path);
        if (typeof schema === "boolean") {
          store.addStatement(reference.path, {
            name: declarationName,
            kind: "typeAlias",
            value: factory.TypeAliasDeclaration.create({
              export: true,
              name: converterContext.escapeDeclarationText(declarationName),
              type: ToTypeNode.convert(entryPoint, currentPoint, factory, schema, context, converterContext),
            }),
          });
        } else if (!Guard.isReference(schema)) {
          Schema.addSchema(entryPoint, currentPoint, store, factory, reference.path, declarationName, schema, context, converterContext);
        }
        return;
      }
      if (!store.isAfterDefined(reference.path)) {
        const { maybeResolvedName } = resolveReferencePath(currentPoint, reference.path);
        const value = factory.TypeAliasDeclaration.create({
          export: true,
          name: converterContext.escapeDeclarationText(reference.name),
          type: factory.TypeReferenceNode.create({
            name: converterContext.escapeTypeReferenceNodeName(maybeResolvedName),
          }),
        });
        store.addStatement(reference.path, {
          name: reference.name,
          kind: "typeAlias",
          value,
        });
      }
    }
  };
  return {
    rootSchema,
    setReferenceHandler: setReferenceHandler,
    resolveReferencePath: resolveReferencePath,
    findSchemaByPathArray: findSchemaByPathArray,
  };
};
