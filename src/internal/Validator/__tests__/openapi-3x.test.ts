import { describe, expect, test } from "vitest";
import { CodeGenerator } from "../../../";
import * as Templates from "../../../templates";
import type * as Types from "../../../types";
import { validate } from "../index";

const openapi31Document: Types.OpenApi.Document = {
  openapi: "3.1.0",
  info: {
    title: "OpenAPI 3.1 test",
    version: "1.0.0",
    license: {
      name: "MIT",
      identifier: "MIT",
    },
  },
  servers: [{ url: "/" }],
  jsonSchemaDialect: "https://spec.openapis.org/oas/3.1/dialect/base",
  webhooks: {
    userCreated: {
      post: {
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: ["object", "null"],
                $schema: "https://json-schema.org/draft/2020-12/schema",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    pathItems: {
      UserCreated: {
        post: {
          operationId: "userCreated",
          responses: {
            "202": {
              description: "Accepted",
            },
          },
        },
      },
    },
    schemas: {
      Nullable: {
        type: ["string", "null"],
      },
      MixedEnum: {
        enum: ["ready", null],
      },
      Tuple: {
        type: "array",
        prefixItems: [{ type: "string" }, { type: "number" }],
        items: false,
      },
      AllowAll: true,
      DenyAll: false,
      ObjectWithBooleanSchema: {
        type: "object",
        properties: {
          denied: false,
        },
      },
      WithDefs: {
        type: "object",
        $defs: {
          Status: { const: "ready" },
        },
        properties: {
          status: { $ref: "#/$defs/Status" },
        },
      },
      State: {
        const: "ready",
      },
      RefNullable: {
        $ref: "#/components/schemas/State",
        nullable: true,
      },
    },
  },
};

const openapi32Document: Types.OpenApi.Document = {
  openapi: "3.2.0",
  $self: "https://example.com/openapi",
  info: {
    title: "OpenAPI 3.2 test",
    summary: "A short summary",
    version: "1.0.0",
    license: {
      name: "MIT",
      identifier: "MIT",
    },
  },
  servers: [{ url: "/", name: "default" }],
  tags: [
    {
      name: "users",
      summary: "Users",
      parent: "resources",
      kind: "nav",
    },
  ],
  paths: {
    "/users": {
      get: {
        operationId: "listUsers",
        parameters: [
          {
            name: "filter",
            in: "querystring",
            content: {
              "application/json": {
                schema: { type: "object" },
              },
            },
          },
        ],
        responses: {
          "200": {
            summary: "Users response",
            description: "OK",
            content: {
              "application/jsonl": {
                itemSchema: { type: "string" },
              },
              "application/x-ndjson": {
                $ref: "#/components/mediaTypes/LogEntry",
                summary: "Log entries",
              },
            },
          },
        },
      },
      query: {
        operationId: "queryUsers",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "string" },
              },
            },
          },
        },
      },
      additionalOperations: {
        PURGE: {
          operationId: "purgeUsers",
          responses: {
            "204": {
              description: "No Content",
              content: {
                "application/json": {
                  schema: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    mediaTypes: {
      LogEntry: {
        description: "A streamed log entry",
        itemSchema: { type: "string" },
        prefixEncoding: [{ contentType: "text/plain" }],
        itemEncoding: { contentType: "text/plain" },
      },
    },
    examples: {
      LogEntry: {
        dataValue: "ready",
        serializedValue: "ready",
      },
    },
    securitySchemes: {
      apiKey: {
        type: "apiKey",
        name: "X-API-Key",
        in: "header",
        deprecated: true,
      },
    },
    schemas: {
      XmlNode: {
        type: "object",
        xml: { nodeType: "element" },
        discriminator: {
          propertyName: "kind",
          defaultMapping: "XmlNode",
        },
      },
    },
  },
};

describe("OpenAPI 3.x validation", () => {
  test("accepts OpenAPI 3.1 JSON Schema and webhook fields", () => {
    expect(() => validate(openapi31Document)).not.toThrow();
  });

  test("accepts OpenAPI 3.2 fields", () => {
    expect(() => validate(openapi32Document)).not.toThrow();
  });
});

describe("OpenAPI 3.x generation", () => {
  test("generates OpenAPI 3.1 type arrays and const values", () => {
    const code = new CodeGenerator(openapi31Document).generateTypeDefinition();

    expect(code).toContain("export type Nullable = string | null;");
    expect(code).toContain('export type MixedEnum = "ready" | null;');
    expect(code).toContain("export type Tuple = [string, number];");
    expect(code).toContain("export type AllowAll = any;");
    expect(code).toContain("export type DenyAll = never;");
    expect(code).toContain("denied?: never;");
    expect(code).toContain('status?: "ready";');
    expect(code).toContain('export type State = "ready";');
    expect(code).toContain('export type RefNullable = "ready" | null;');
    expect(code).toContain("export namespace PathItems");
    expect(code).toContain("export namespace UserCreated");
  });

  test("generates OpenAPI 3.2 itemSchema and querystring content", () => {
    const generator = new CodeGenerator(openapi32Document);
    const code = generator.generateTypeDefinition([generator.getAdditionalTypeDefinitionCustomCodeGenerator()]);

    expect(code).toContain('"application/jsonl": string;');
    expect(code).toContain('"application/x-ndjson": MediaTypes.LogEntry;');
    expect(code).toContain("filter?: {}");
    expect(code).toContain("Response$queryUsers$Status$200");
    expect(code).toContain("Response$purgeUsers$Status$204");

    const operationParams = generator.getCodeGeneratorParamsArray();
    const listUsers = operationParams.find(({ operationId }) => operationId === "listUsers");
    expect(listUsers?.convertedParams.hasQueryParameters).toBe(true);
    expect(listUsers?.convertedParams.pickedParameters).toContainEqual(expect.objectContaining({ in: "querystring" }));

    const clientCode = generator.generateCode([{ generator: Templates.FunctionalApiClient.generator }]);
    expect(clientCode).toContain('httpMethod: "QUERY"');
    expect(clientCode).toContain('httpMethod: "PURGE" as HttpMethod');
  });

  test("treats a null property schema as any for legacy fixtures", () => {
    const document = structuredClone(openapi31Document);
    document.components = {
      schemas: {
        NullProperty: {
          type: "object",
          properties: {
            legacy: null as never,
          },
        },
      },
    };

    const code = new CodeGenerator(document).generateTypeDefinition();

    expect(code).toContain("legacy?: any;");
  });
});
