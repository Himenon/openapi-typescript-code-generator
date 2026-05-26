import { describe, expect, test } from "vitest";

import { TsGenerator } from "../../../../api";
import type { CodeGenerator } from "../../../../types";
import * as Utils from "../../utils";
import * as PathParameter from "../PathParameter";

// テンプレートリテラル式の文字列表現を組み立てるヘルパー。
// "$" を分離して結合することで noTemplateCurlyInString を回避している。
// biome-ignore lint/style/useTemplate: "$" + template is intentional to prevent noTemplateCurlyInString
const p = (name: string): string => "$" + `{encodeURIComponent(params.parameter.${name})}`;
const tpl = (...parts: string[]): string => `\`${parts.join("")}\``;

describe("PathParameter Test", () => {
  const factory = TsGenerator.Factory.create();
  const generate = (url: string, pathParameter: CodeGenerator.PickedParameter[]): string => {
    const urlTemplates = PathParameter.generateUrlTemplateExpression(factory, url, pathParameter);
    return Utils.generateTemplateExpression(factory, urlTemplates);
  };
  test("generateUrlTemplateExpression", () => {
    expect(generate("/{a}", [{ in: "path", name: "a", required: true }])).toEqual(tpl("/", p("a")));
    expect(generate("/{a}/", [{ in: "path", name: "a", required: true }])).toEqual(tpl("/", p("a"), "/"));
    expect(generate("/a/{b}", [{ in: "path", name: "b", required: true }])).toEqual(tpl("/a/", p("b")));
    expect(generate("/a/{b}/", [{ in: "path", name: "b", required: true }])).toEqual(tpl("/a/", p("b"), "/"));
    expect(generate("/a/{b}/c", [{ in: "path", name: "b", required: true }])).toEqual(tpl("/a/", p("b"), "/c"));
    expect(generate("/a/{b}/c/", [{ in: "path", name: "b", required: true }])).toEqual(tpl("/a/", p("b"), "/c/"));
    expect(generate("/a/b/{c}", [{ in: "path", name: "c", required: true }])).toEqual(tpl("/a/b/", p("c")));
    expect(generate("/a/b/{c}", [{ in: "path", name: "c", required: true }])).toEqual(tpl("/a/b/", p("c")));
    expect(generate("/a/b/{c}/", [{ in: "path", name: "c", required: true }])).toEqual(tpl("/a/b/", p("c"), "/"));
    expect(generate("/a/b/{c}.json", [{ in: "path", name: "c", required: true }])).toEqual(tpl("/a/b/", p("c"), ".json"));
    expect(generate("/{a}.json/{a}.json/{a}.json", [{ in: "path", name: "a", required: true }])).toEqual(
      tpl("/", p("a"), ".json/", p("a"), ".json/", p("a"), ".json"),
    );
    expect(generate("/.json.{a}.json/{a}.json.{a}", [{ in: "path", name: "a", required: true }])).toEqual(
      tpl("/.json.", p("a"), ".json/", p("a"), ".json.", p("a")),
    );

    expect(
      generate("/{a}/{b}", [
        { in: "path", name: "a", required: true },
        { in: "path", name: "b", required: true },
      ]),
    ).toBe(tpl("/", p("a"), "/", p("b")));
    expect(
      generate("/{a}/{b}/", [
        { in: "path", name: "a", required: true },
        { in: "path", name: "b", required: true },
      ]),
    ).toBe(tpl("/", p("a"), "/", p("b"), "/"));
    expect(
      generate("/{a}/{b}/c", [
        { in: "path", name: "a", required: true },
        { in: "path", name: "b", required: true },
      ]),
    ).toBe(tpl("/", p("a"), "/", p("b"), "/c"));
    expect(
      generate("/{a}/{b}/c/", [
        { in: "path", name: "a", required: true },
        { in: "path", name: "b", required: true },
      ]),
    ).toBe(tpl("/", p("a"), "/", p("b"), "/c/"));
    expect(
      generate("/{a}/b/{c}", [
        { in: "path", name: "a", required: true },
        { in: "path", name: "c", required: true },
      ]),
    ).toBe(tpl("/", p("a"), "/b/", p("c")));
    expect(
      generate("/{a}/b/{c}/", [
        { in: "path", name: "a", required: true },
        { in: "path", name: "c", required: true },
      ]),
    ).toBe(tpl("/", p("a"), "/b/", p("c"), "/"));
    expect(
      generate("/a/{b}/{c}", [
        { in: "path", name: "b", required: true },
        { in: "path", name: "c", required: true },
      ]),
    ).toBe(tpl("/a/", p("b"), "/", p("c")));
    expect(
      generate("/a/{b}/{c}/", [
        { in: "path", name: "b", required: true },
        { in: "path", name: "c", required: true },
      ]),
    ).toBe(tpl("/a/", p("b"), "/", p("c"), "/"));
    expect(
      generate("/a/{b}...{c}/", [
        { in: "path", name: "b", required: true },
        { in: "path", name: "c", required: true },
      ]),
    ).toBe(tpl("/a/", p("b"), "...", p("c"), "/"));
  });
});
