import {
  JSONSchema7 as JSONSchema,
  JSONSchema7Definition as JSONSchemaDefinition,
  JSONSchema7TypeName as JSONSchemaTypeName,
  JSONSchema7Type as JSONSchemaType,
} from "json-schema";

export { JSONSchema, JSONSchemaDefinition, JSONSchemaType, JSONSchemaTypeName };

export type MapLike<K extends string, T> = {
  [key in K]: T;
};

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#serverVariableObject
 */
export interface ServerVariable {
  enum: string[];
  default?: string; // TODO enumの型で縛る
  description?: string;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#serverObject
 */
export interface Server {
  url: string;
  description?: string;
  variables?: MapLike<string, ServerVariable>;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#referenceObject
 */
export interface Reference {
  $ref: string;
  summary?: string;
  description?: string;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#licenseObject
 */
export interface License {
  name: string;
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
  value?: any;
  externalValue?: string;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#parameterObject
 */
export interface Parameter {
  // Fixed Fields
  name: string;
  in: "path" | "query" | "header" | "cookie";
  description?: string;
  required: boolean;
  deprecated?: boolean;
  allowEmptyValue: boolean;

  style?: "matrix" | "label" | "form" | "simple" | "spaceDelimited" | "pipeDelimited" | "deepObject";
  explode?: string;
  allowReserved?: boolean;
  schema?: Schema;
  example?: any;
  examples?: MapLike<string, Example | Reference>;

  content?: MapLike<string, MediaType>;
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
  headers?: MapLike<string, Header | Reference>;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#mediaTypeObject
 */
export interface MediaType {
  schema?: Schema;
  example?: any;
  examples?: MapLike<string, Example | Reference>;
  encoding?: MapLike<string, Encoding>;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#requestBodyObject
 */
export interface RequestBody {
  description?: string;
  content: MapLike<string, MediaType>;
  required: boolean; // default: false
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#responseObject
 */
export interface Response {
  description: string;
  headers?: MapLike<string, Header | Reference>;
  content?: MapLike<string, MediaType>;
  links?: MapLike<string, Link | Reference>;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#responsesObject
 */
export interface Responses {
  default: Response | Reference;
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
  scopes: MapLike<string, string>;
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
  description?: string;
  name: string;
  in: "query" | "header" | "cookie";
  scheme: string;
  bearerFormat?: string;
  flows: OAuthFlows;
  openIdConnectUrl: string;
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
  mapping: MapLike<string, string>;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#discriminatorObject
 */
export interface XML {
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
  parameters?: MapLike<string, any | string>;
  requestBody?: MapLike<string, any | string>;
  description: string;
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
  parameters?: [Parameter | Reference];
  requestBody?: RequestBody | Reference;
  responses?: Responses;
  callbacks?: MapLike<string, Callback | Reference>;
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
  servers?: Server[];
  parameters?: (Parameter | Reference)[];
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#infoObject
 */
export interface Info {
  title: string;
  summary: string;
  description: string;
  termsOfService: string;
  contact?: Contact;
  license?: License;
  version: string;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#pathsObject
 */
export interface Paths {
  [path: string]: PathItem;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#componentsObject
 */
export interface Components {
  schemas?: MapLike<string, Schema | Reference>;
  responses?: MapLike<string, Response | Reference>;
  parameters?: MapLike<string, Parameter | Reference>;
  examples?: MapLike<string, Example | Reference>;
  requestBodies?: MapLike<string, RequestBody | Reference>;
  headers?: MapLike<string, Header | Reference>;
  securitySchemes?: MapLike<string, SecuritySchema | Reference>;
  links?: MapLike<string, Link | Reference>;
  callbacks?: MapLike<string, Callback>;
  pathItems?: MapLike<string, PathItem>;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#tagObject
 */
export interface Tag {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentation;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#openapi-object
 */
export interface RootTypes {
  openapi: string;
  info: Info;
  servers?: Server[];
  paths?: Paths;
  webhooks?: MapLike<string, PathItem | Reference>;
  components?: Components;
  security?: SecurityRequirement;
  tags?: Tag[];
  externalDocs?: ExternalDocumentation;
}
