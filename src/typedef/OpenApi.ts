import type { JSONSchema7, JSONSchema7TypeName, JSONSchema7Type as JSONSchemaType } from "json-schema";

export type JSONSchemaTypeName = JSONSchema7TypeName;

/**
 * OpenAPI 3.0 の Schema Object と、OpenAPI 3.1 以降で採用された
 * JSON Schema Draft 2020-12 のキーワードを表します。
 */
export interface JSONSchema
  extends Omit<
    JSONSchema7,
    | "type"
    | "items"
    | "additionalItems"
    | "additionalProperties"
    | "properties"
    | "patternProperties"
    | "allOf"
    | "oneOf"
    | "anyOf"
    | "not"
    | "contains"
    | "if"
    | "then"
    | "else"
    | "propertyNames"
    | "dependencies"
    | "definitions"
    | "exclusiveMinimum"
    | "exclusiveMaximum"
    | "examples"
    | "$defs"
  > {
  /** OpenAPI 3.1 で JSON Schema の型配列が利用可能になりました。 */
  type?: JSONSchemaTypeName | JSONSchemaTypeName[];
  items?: JSONSchemaDefinition | JSONSchemaDefinition[];
  /** OpenAPI 3.1 で JSON Schema のタプル用キーワード prefixItems が追加されました。 */
  prefixItems?: JSONSchemaDefinition[];
  additionalItems?: JSONSchemaDefinition;
  additionalProperties?: JSONSchemaDefinition;
  properties?: Record<string, JSONSchemaDefinition>;
  patternProperties?: Record<string, JSONSchemaDefinition>;
  allOf?: JSONSchemaDefinition[];
  oneOf?: JSONSchemaDefinition[];
  anyOf?: JSONSchemaDefinition[];
  not?: JSONSchemaDefinition;
  contains?: JSONSchemaDefinition;
  if?: JSONSchemaDefinition;
  then?: JSONSchemaDefinition;
  else?: JSONSchemaDefinition;
  propertyNames?: JSONSchemaDefinition;
  dependencies?: Record<string, JSONSchemaDefinition | string[]>;
  definitions?: Record<string, JSONSchemaDefinition>;
  /** OpenAPI 3.1 で $defs が追加され、definitions の後継になりました。 */
  $defs?: Record<string, JSONSchemaDefinition>;
  /** OpenAPI 3.1 で追加された JSON Schema の動的参照用キーワードです。 */
  $dynamicRef?: string;
  /** OpenAPI 3.1 で追加された JSON Schema の動的アンカーです。 */
  $dynamicAnchor?: string;
  /** OpenAPI 3.1 で追加された JSON Schema のアンカーです。 */
  $anchor?: string;
  /** OpenAPI 3.1 で追加された JSON Schema vocabulary の宣言です。 */
  $vocabulary?: Record<string, boolean>;
  /** OpenAPI 3.1 では排他的境界値が boolean から number に変更されました。 */
  exclusiveMinimum?: number | boolean;
  /** OpenAPI 3.1 では排他的境界値が boolean から number に変更されました。 */
  exclusiveMaximum?: number | boolean;
  /** OpenAPI 3.1 の JSON Schema examples は複数値を持てます。 */
  examples?: JSONSchemaType[];
  /** OpenAPI 3.1 で依存スキーマを表す JSON Schema キーワードが追加されました。 */
  dependentSchemas?: Record<string, JSONSchemaDefinition>;
  /** OpenAPI 3.1 で依存する必須プロパティを表すキーワードが追加されました。 */
  dependentRequired?: Record<string, string[]>;
  /** OpenAPI 3.1 で未評価の item と property を表すキーワードが追加されました。 */
  unevaluatedItems?: JSONSchemaDefinition;
  unevaluatedProperties?: JSONSchemaDefinition;
  /** OpenAPI 3.1 で contains の出現回数を制約するキーワードが追加されました。 */
  minContains?: number;
  maxContains?: number;
  /** OpenAPI 3.1 で contentEncoding と組み合わせる Schema が追加されました。 */
  contentSchema?: JSONSchemaDefinition;
  /** OpenAPI 3.0 の nullable は後方互換のためにサポートします。 */
  nullable?: boolean;
}

export type JSONSchemaDefinition = JSONSchema | boolean; // JSONSchema7Definition

export type { JSONSchemaType };

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#serverVariableObject
 */
export interface ServerVariable {
  enum: string[];
  default?: string; // TODO change enum
  description?: string;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#serverObject
 */
export interface Server {
  url: string;
  description?: string;
  /** OpenAPI 3.2 で追加された Server Object の識別名です。 */
  name?: string;
  variables?: Record<string, ServerVariable>;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#referenceObject
 */
export interface Reference {
  $ref: string;
  /** OpenAPI 3.1 で Reference Object に追加された要約です。 */
  summary?: string;
  /** OpenAPI 3.1 で Reference Object に追加された説明です。 */
  description?: string;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#licenseObject
 */
export interface License {
  name: string;
  /** OpenAPI 3.1 で追加された SPDX ライセンス識別子です。 */
  identifier?: string;
  url?: string;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#contactObject
 */
export interface Contact {
  name?: string;
  url?: string;
  email?: string;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#externalDocumentationObject
 */
export interface ExternalDocumentation {
  url: string;
  description?: string;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#exampleObject
 */
export interface Example {
  summary?: string;
  description?: string;
  /** OpenAPI 3.2 で追加された、シリアライズ前の例データです。 */
  dataValue?: any;
  /** OpenAPI 3.2 で追加された、シリアライズ済みの例データです。 */
  serializedValue?: string;
  value?: any;
  externalValue?: string;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#parameterObject
 */
export interface Parameter {
  // Fixed Fields
  name: string;
  /** OpenAPI 3.2 で querystring が追加されました。 */
  in: "path" | "query" | "querystring" | "header" | "cookie";
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;

  style?: "matrix" | "label" | "form" | "simple" | "spaceDelimited" | "pipeDelimited" | "deepObject";
  explode?: boolean;
  allowReserved?: boolean;
  schema?: JSONSchemaDefinition;
  example?: any;
  examples?: Record<string, Example | Reference>;

  content?: Record<string, MediaType | Reference>;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#headerObject
 */
export type Header = Omit<Parameter, "name" | "in">;

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#encodingObject
 */
export interface Encoding {
  contentType?: string;
  headers?: Record<string, Header | Reference>;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  /** OpenAPI 3.2 で追加された、配列の各 prefix item に対応する Encoding です。 */
  prefixEncoding?: Encoding[];
  /** OpenAPI 3.2 で追加された、配列の残りの item に対応する Encoding です。 */
  itemEncoding?: Encoding;
  /** OpenAPI 3.2 で追加された、名前付きの入れ子 Encoding です。 */
  encoding?: Record<string, Encoding>;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#mediaTypeObject
 */
export interface MediaType {
  description?: string;
  schema?: JSONSchemaDefinition | Reference;
  /** OpenAPI 3.2 で追加された、ストリーミングの各 item 用 Schema です。 */
  itemSchema?: JSONSchemaDefinition | Reference;
  /** OpenAPI 3.2 で追加された、配列の各 prefix item 用 Encoding です。 */
  prefixEncoding?: Encoding[];
  /** OpenAPI 3.2 で追加された、配列の残りの item 用 Encoding です。 */
  itemEncoding?: Encoding;
  example?: any;
  examples?: Record<string, Example | Reference>;
  encoding?: Record<string, Encoding>;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#requestBodyObject
 */
export interface RequestBody {
  description?: string;
  content: Record<string, MediaType | Reference>;
  required?: boolean; // default: false
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#responseObject
 */
export interface Response {
  /** OpenAPI 3.2 で追加された Response の短い要約です。 */
  summary?: string;
  description?: string;
  headers?: Record<string, Header | Reference>;
  content?: Record<string, MediaType | Reference>;
  links?: Record<string, Link | Reference>;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#responsesObject
 */
export interface Responses {
  [statusCode: string]: Response | Reference;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#callbackObject
 */
export interface Callback {
  [expression: string]: PathItem | Reference;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#oauthFlowObject
 */
export interface OauthFlow {
  authorizationUrl: string;
  tokenUrl: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#oauthFlowsObject
 */
export interface OAuthFlows {
  implicit?: OauthFlow;
  password?: OauthFlow;
  clientCredentials?: OauthFlow;
  authorizationCode?: OauthFlow;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#securitySchemeObject
 */
export interface SecuritySchema {
  type: "apiKey" | "http" | "mutualTLS" | "oauth2" | "openIdConnect";
  /** OpenAPI 3.2 で追加された Security Scheme の非推奨フラグです。 */
  deprecated?: boolean;
  description?: string;
  name?: string;
  in?: "query" | "header" | "cookie";
  scheme?: string;
  bearerFormat?: string;
  flows?: OAuthFlows;
  openIdConnectUrl?: string;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#securityRequirementObject
 */
export interface SecurityRequirement {
  [name: string]: string[];
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#discriminatorObject
 */
export interface Discriminator {
  propertyName: string;
  mapping?: Record<string, string>;
  /** OpenAPI 3.2 で追加された、判別プロパティがない場合の既定マッピングです。 */
  defaultMapping?: string;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#discriminatorObject
 */
export interface XML {
  /** OpenAPI 3.2 で追加された XML ノード種別です。 */
  nodeType?: "element" | "attribute" | "text" | "cdata" | "none";
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#schemaObject
 */
export interface Schema extends JSONSchema {
  discriminator?: Discriminator;
  xml?: XML;
  externalDocs?: ExternalDocumentation;
  example?: any;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#linkObject
 */
export interface Link {
  operationRef?: string;
  operationId?: string;
  parameters?: Record<string, any | string>;
  requestBody?: Record<string, any | string>;
  description?: string;
  server?: Server;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#operationObject
 */
export interface Operation {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentation;
  operationId?: string;
  parameters?: (Parameter | Reference)[];
  requestBody?: RequestBody | Reference;
  responses?: Responses;
  callbacks?: Record<string, Callback | Reference>;
  deprecated?: boolean;
  security?: SecurityRequirement[];
  servers?: Server[];
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#pathItemObject
 */
export interface PathItem {
  $ref?: string;
  summary?: string;
  description?: string;
  get?: Operation;
  put?: Operation;
  post?: Operation;
  delete?: Operation;
  options?: Operation;
  head?: Operation;
  patch?: Operation;
  trace?: Operation;
  /** OpenAPI 3.2 で追加された、標準外 HTTP メソッドの操作です。 */
  additionalOperations?: Record<string, Operation>;
  /** OpenAPI 3.2 で追加された QUERY メソッドの操作です。 */
  query?: Operation;
  servers?: Server[];
  parameters?: (Parameter | Reference)[];
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#infoObject
 */
export interface Info {
  title: string;
  /** OpenAPI 3.2 で追加された API の短い要約です。 */
  summary?: string;
  description?: string;
  termsOfService?: string;
  contact?: Contact;
  license?: License;
  version: string;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#pathsObject
 */
export interface Paths {
  [path: string]: PathItem | Reference;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#componentsObject
 */
export interface Components {
  schemas?: Record<string, Schema | Reference | boolean>;
  responses?: Record<string, Response | Reference>;
  parameters?: Record<string, Parameter | Reference>;
  examples?: Record<string, Example | Reference>;
  requestBodies?: Record<string, RequestBody | Reference>;
  headers?: Record<string, Header | Reference>;
  securitySchemes?: Record<string, SecuritySchema | Reference>;
  links?: Record<string, Link | Reference>;
  callbacks?: Record<string, Callback | Reference>;
  /** OpenAPI 3.1 で追加された再利用可能な Path Item です。 */
  pathItems?: Record<string, PathItem | Reference>;
  /** OpenAPI 3.2 で追加された再利用可能な Media Type です。 */
  mediaTypes?: Record<string, MediaType | Reference>;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#tagObject
 */
export interface Tag {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentation;
  /** OpenAPI 3.2 で追加された表示用の短い要約です。 */
  summary?: string;
  /** OpenAPI 3.2 で追加された親タグ名です。 */
  parent?: string;
  /** OpenAPI 3.2 で追加されたタグ分類です。 */
  kind?: string;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#openapi-object
 */
export interface Document {
  openapi: string;
  info: Info;
  /** OpenAPI 3.1 で追加された Schema Object の既定 JSON Schema dialect です。 */
  jsonSchemaDialect?: string;
  /** OpenAPI 3.2 で追加された、この文書自身を表す URI 参照です。 */
  $self?: string;
  servers?: Server[];
  paths?: Paths;
  webhooks?: Record<string, PathItem | Reference>;
  components?: Components;
  security?: SecurityRequirement[];
  tags?: Tag[];
  externalDocs?: ExternalDocumentation;
}
