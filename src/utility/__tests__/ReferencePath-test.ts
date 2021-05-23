import * as ReferencePath from "../ReferencePath";

describe("ReferencePath test", () => {
  test("normalizeLocalReferencePoint", () => {
    expect(ReferencePath.normalizeLocalReferencePoint("#/a/b/c")).toBe("a/b/c");
  });
  test("normalizeRemoteReferencePoint", () => {
    expect(ReferencePath.normalizeRemoteReferencePoint("a.yml", "d.yml")).toBe("d.yml");
    expect(ReferencePath.normalizeRemoteReferencePoint("a.yml", "./d.yml")).toBe("d.yml");
    expect(ReferencePath.normalizeRemoteReferencePoint("./a.yml", "d.yml")).toBe("d.yml");
    expect(ReferencePath.normalizeRemoteReferencePoint("./a.yml", "./d.yml")).toBe("d.yml");

    expect(ReferencePath.normalizeRemoteReferencePoint("a/b.yml", "../d.yml")).toBe("d.yml");
    expect(ReferencePath.normalizeRemoteReferencePoint("./a/b.yml", "../d.yml")).toBe("d.yml");

    expect(ReferencePath.normalizeRemoteReferencePoint("a/b.yml", "d.yml")).toBe("a/d.yml");
    expect(ReferencePath.normalizeRemoteReferencePoint("a/b.yml", "./d.yml")).toBe("a/d.yml");
    expect(ReferencePath.normalizeRemoteReferencePoint("./a/b.yml", "d.yml")).toBe("a/d.yml");
    expect(ReferencePath.normalizeRemoteReferencePoint("./a/b.yml", "./d.yml")).toBe("a/d.yml");

    expect(ReferencePath.normalizeRemoteReferencePoint("a/b/c.yml", "./d.yml")).toBe("a/b/d.yml");
    expect(ReferencePath.normalizeRemoteReferencePoint("a/b/c.yml", "./d.yml")).toBe("a/b/d.yml");
    expect(ReferencePath.normalizeRemoteReferencePoint("a/b/c.yml", "./d.yml")).toBe("a/b/d.yml");
    expect(ReferencePath.normalizeRemoteReferencePoint("a/b/c.yml", "./d.yml")).toBe("a/b/d.yml");
  });
});
