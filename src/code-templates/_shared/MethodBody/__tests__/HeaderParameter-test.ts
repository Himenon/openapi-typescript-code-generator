import { describe, expect, test } from "vitest";

import { TsGenerator } from "../../../../api";
import * as HeaderParameter from "../HeaderParameter";

describe("HeaderParameter Test", () => {
  const factory = TsGenerator.Factory.create();

  test("preserves hyphenated Xquik api key header names", () => {
    expect(
      HeaderParameter.create(factory, {
        variableName: "headers",
        object: {
          "x-api-key": { type: "variable", value: 'params.parameter["x-api-key"]' },
          "Xquik-Api-Key": { type: "variable", value: 'params.parameter["Xquik-Api-Key"]' },
        },
      }),
    ).toBe(`const headers = {
    "x-api-key": params.parameter["x-api-key"],
    "Xquik-Api-Key": params.parameter["Xquik-Api-Key"]
};`);
  });
});
