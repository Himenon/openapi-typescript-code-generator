import { describe, expect, it } from "vitest";
import { generateValidRootSchema } from "../generateValidRootSchema";
import type * as Types from "../types";

describe("generateValidRootSchema", () => {
  describe("パスパラメータの required 正規化", () => {
    it("paths 直下のオペレーションに定義されたパスパラメータで required を省略した場合、required: true が設定されること", () => {
      const input: Types.OpenApi.Document = {
        openapi: "3.1.0",
        info: { title: "test", version: "1.0.0", summary: "", description: "", termsOfService: "" },
        paths: {
          "/items/{id}": {
            get: {
              operationId: "getItemById",
              parameters: [
                {
                  in: "path",
                  name: "id",
                  required: false,
                  schema: { type: "string" },
                },
              ],
              responses: { default: { description: "default" } },
            },
          },
        },
      };

      const result = generateValidRootSchema(input);

      const parameter = result.paths!["/items/{id}"]!.get!.parameters![0] as Types.OpenApi.Parameter;
      expect(parameter.required).toBe(true);
    });

    it("paths 直下のオペレーションに定義されたパスパラメータで required を省略した場合でも required: true が設定されること", () => {
      const input: Types.OpenApi.Document = {
        openapi: "3.1.0",
        info: { title: "test", version: "1.0.0", summary: "", description: "", termsOfService: "" },
        paths: {
          "/items/{id}": {
            get: {
              operationId: "getItemById",
              // required フィールド自体を省略
              parameters: [{ in: "path", name: "id", required: undefined as unknown as boolean, schema: { type: "string" } }],
              responses: { default: { description: "default" } },
            },
          },
        },
      };

      const result = generateValidRootSchema(input);

      const parameter = result.paths!["/items/{id}"]!.get!.parameters![0] as Types.OpenApi.Parameter;
      expect(parameter.required).toBe(true);
    });

    it("PathItem レベルのパスパラメータで required を省略した場合、required: true が設定されること", () => {
      const input: Types.OpenApi.Document = {
        openapi: "3.1.0",
        info: { title: "test", version: "1.0.0", summary: "", description: "", termsOfService: "" },
        paths: {
          "/items/{id}": {
            parameters: [{ in: "path", name: "id", required: false, schema: { type: "string" } }],
            get: {
              operationId: "getItemById",
              responses: { default: { description: "default" } },
            },
          },
        },
      };

      const result = generateValidRootSchema(input);

      const parameter = result.paths!["/items/{id}"]!.parameters![0] as Types.OpenApi.Parameter;
      expect(parameter.required).toBe(true);
    });

    it("components.parameters に定義されたパスパラメータで required を省略した場合、required: true が設定されること", () => {
      const input: Types.OpenApi.Document = {
        openapi: "3.1.0",
        info: { title: "test", version: "1.0.0", summary: "", description: "", termsOfService: "" },
        components: {
          parameters: {
            ItemId: { in: "path", name: "id", required: false, schema: { type: "string" } },
          },
        },
      };

      const result = generateValidRootSchema(input);

      const parameter = result.components!.parameters!["ItemId"] as Types.OpenApi.Parameter;
      expect(parameter.required).toBe(true);
    });

    it("クエリパラメータで required を省略した場合、required フィールドは変更されないこと", () => {
      const input: Types.OpenApi.Document = {
        openapi: "3.1.0",
        info: { title: "test", version: "1.0.0", summary: "", description: "", termsOfService: "" },
        paths: {
          "/items": {
            get: {
              operationId: "getItems",
              parameters: [{ in: "query", name: "filter", required: false, schema: { type: "string" } }],
              responses: { default: { description: "default" } },
            },
          },
        },
      };

      const result = generateValidRootSchema(input);

      const parameter = result.paths!["/items"]!.get!.parameters![0] as Types.OpenApi.Parameter;
      expect(parameter.required).toBe(false);
    });

    it("パスパラメータと明示的に required: true が設定されている場合、その値が維持されること", () => {
      const input: Types.OpenApi.Document = {
        openapi: "3.1.0",
        info: { title: "test", version: "1.0.0", summary: "", description: "", termsOfService: "" },
        paths: {
          "/items/{id}": {
            get: {
              operationId: "getItemById",
              parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
              responses: { default: { description: "default" } },
            },
          },
        },
      };

      const result = generateValidRootSchema(input);

      const parameter = result.paths!["/items/{id}"]!.get!.parameters![0] as Types.OpenApi.Parameter;
      expect(parameter.required).toBe(true);
    });
  });
});
