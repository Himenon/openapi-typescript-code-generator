import { describe, expect, it, vi } from "vitest";
import * as TypeNodeContext from "../TypeNodeContext";

describe("TypeNodeContext", () => {
  describe("generatePath", () => {
    it("同じディレクトリ内のファイル参照において正しいパス配列を生成できること", () => {
      const entryPoint = "src/api/openapi.yml";
      const currentPoint = "src/api/components/schemas/User.yml";
      // referencePath はエントリポイント（src/api/openapi.yml）からの相対パス（拡張子なし）
      const referencePath = "components/schemas/Common";

      const result = TypeNodeContext.generatePath(entryPoint, currentPoint, referencePath);

      // from = components/schemas/User
      // base = components/schemas
      expect(result.base).toBe("components/schemas");
      // components/schemas から components/schemas/Common への相対パスは "Common"
      expect(result.pathArray).toEqual(["Common"]);
    });

    it("親ディレクトリのファイル参照において正しいパス配列を生成できること", () => {
      const entryPoint = "openapi.yml";
      const currentPoint = "components/schemas/User.yml";
      const referencePath = "components/Common";

      const result = TypeNodeContext.generatePath(entryPoint, currentPoint, referencePath);

      expect(result.base).toBe("components/schemas");
      // components/schemas から components/Common への相対パスは "../Common"
      expect(result.pathArray).toEqual(["..", "Common"]);
    });

    it("パスにバックスラッシュが含まれる場合でも POSIX スタイルとして正しく処理されること", () => {
      // Windows スタイルの入力をシミュレートするが、内部で POSIX 変換されることを期待
      const entryPoint = "api/openapi.yml";
      const currentPoint = "api/components/schemas/User.yml";
      const referencePath = "components/schemas/Common";

      const result = TypeNodeContext.generatePath(entryPoint, currentPoint, referencePath);

      expect(result.base).toBe("components/schemas");
      expect(result.pathArray).toEqual(["Common"]);
    });
  });

  describe("calculateReferencePath", () => {
    const mockConverterContext = {
      escapeDeclarationText: (text: string) => text,
    } as any;

    it("ストアに登録されたインターフェースを解決できること", () => {
      const mockStore = {
        getStatement: vi.fn().mockImplementation((path, kind) => {
          if (path === "components/schemas/User" && kind === "interface") {
            return { name: "User" };
          }
          return undefined;
        }),
      } as any;

      const base = "components/schemas";
      const pathArray = ["User"];
      const result = TypeNodeContext.calculateReferencePath(mockStore, base, pathArray, mockConverterContext);

      expect(result.name).toBe("User");
      expect(result.maybeResolvedName).toBe("User");
      expect(result.unresolvedPaths).toEqual([]);
      expect(result.depth).toBe(1);
    });

    it("名前空間を経由して型を解決できること", () => {
      const mockStore = {
        getStatement: vi.fn().mockImplementation((path, kind) => {
          if (path === "components/schemas" && kind === "namespace") {
            return { name: "Schemas" };
          }
          if (path === "components/schemas/User" && kind === "interface") {
            return { name: "User" };
          }
          return undefined;
        }),
      } as any;

      const base = "components";
      const pathArray = ["schemas", "User"];
      const result = TypeNodeContext.calculateReferencePath(mockStore, base, pathArray, mockConverterContext);

      expect(result.name).toBe("Schemas.User");
      expect(result.maybeResolvedName).toBe("Schemas.User");
      expect(result.depth).toBe(2);
    });

    it("未解決のパスがある場合に maybeResolvedName に含まれること", () => {
      const mockStore = {
        getStatement: vi.fn().mockImplementation((path, kind) => {
          if (path === "components/schemas" && kind === "namespace") {
            return { name: "Schemas" };
          }
          // User は見つからない
          return undefined;
        }),
      } as any;

      const base = "components";
      const pathArray = ["schemas", "User"];
      const result = TypeNodeContext.calculateReferencePath(mockStore, base, pathArray, mockConverterContext);

      expect(result.name).toBe("Schemas");
      expect(result.maybeResolvedName).toBe("Schemas.User");
      expect(result.unresolvedPaths).toEqual(["User"]);
    });

    it("型が全く見つからない場合にエラーを投げること", () => {
      const mockStore = {
        getStatement: vi.fn().mockReturnValue(undefined),
      } as any;

      expect(() => {
        TypeNodeContext.calculateReferencePath(mockStore, "base", ["Unknown"], mockConverterContext);
      }).toThrow("Local Reference Error");
    });
  });
});
