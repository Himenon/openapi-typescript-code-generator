import { describe, expect, test } from "vitest";
import type * as Types from "../../../types";
import { validate } from "../index";

const createDocument = (operation: Record<string, unknown>): Types.OpenApi.Document => {
  return {
    openapi: "3.0.0",
    info: {
      title: "Validator test",
      version: "1.0.0",
    },
    paths: {
      "/chat": {
        get: operation,
      },
    },
  } as unknown as Types.OpenApi.Document;
};

describe("validate", () => {
  test.each([
    [
      "Parameter Object",
      createDocument({
        parameters: [
          {
            name: "message",
            in: "query",
            schema: { type: "string" },
            example: "hello",
          },
        ],
        responses: { "200": { description: "OK" } },
      }),
    ],
    [
      "Media Type Object",
      createDocument({
        responses: {
          "200": {
            description: "SSE stream",
            content: {
              "text/event-stream": {
                schema: { type: "string" },
                example: "event: message\\ndata: hello",
              },
            },
          },
        },
      }),
    ],
    [
      "Header Object",
      createDocument({
        responses: {
          "200": {
            description: "OK",
            headers: {
              "X-Has-More": {
                schema: { type: "boolean" },
                example: false,
              },
            },
          },
        },
      }),
    ],
    [
      "Link Object",
      createDocument({
        responses: {
          "200": {
            description: "OK",
            links: {
              next: {
                operationId: "getChat",
                parameters: { message: "hello" },
              },
            },
          },
        },
      }),
    ],
  ])("%s の example-like value accepts non-object values", (_name, document) => {
    expect(() => validate(document)).not.toThrow();
  });
});
