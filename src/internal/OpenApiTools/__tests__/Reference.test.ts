import { describe, expect, it } from "vitest";
import * as Reference from "../components/Reference";

describe("Reference", () => {
  describe("getDocumentPoint", () => {
    it("JSON Pointerのフラグメントを除いたファイルパスを返すこと", () => {
      expect(Reference.getDocumentPoint("test/remote.ref.access/v0.yml#/components/schemas/Book")).toBe("test/remote.ref.access/v0.yml");
    });

    it("フラグメントがない場合は入力値をそのまま返すこと", () => {
      expect(Reference.getDocumentPoint("test/remote.ref.access/v0.yml")).toBe("test/remote.ref.access/v0.yml");
    });
  });

  describe("generate", () => {
    it("リモート参照のreferencePointをドキュメント単位で返すこと", () => {
      const result = Reference.generate("test/remote.ref.access/v1.yml", "test/remote.ref.access/v1.yml", {
        $ref: "v0.yml#/components/schemas/Book",
      });

      expect(result).toMatchObject({
        type: "remote",
        referencePoint: "test/remote.ref.access/v0.yml",
        path: "components/schemas/Book",
      });
    });
  });

  describe("resolveRemoteReference", () => {
    it("解決済みリモート参照のreferencePointをドキュメント単位で返すこと", () => {
      const result = Reference.resolveRemoteReference("test/remote.ref.access/v1.yml", "test/remote.ref.access/v1.yml", {
        $ref: "v0.yml#/components/schemas/Book",
      });

      expect(result.referencePoint).toBe("test/remote.ref.access/v0.yml");
      expect(result.data).toMatchObject({
        type: "object",
        properties: {
          id: {
            $ref: "#/components/schemas/BookIDAlias",
          },
        },
      });
    });
  });
});
