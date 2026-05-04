<<<<<<< HEAD
import { describe, expect, test } from "vitest";

import * as fs from "fs";
=======
import * as fs from "node:fs";
import { describe, expect, test } from "vitest";
>>>>>>> 7b64d04cab4a272c3f6e680fa294110083ae3879

import * as Utils from "../../utils";

describe("Argo Rollout", () => {
  test("client.ts", () => {
    const generateCode = fs.readFileSync("test/code/class/argo-rollout/client.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
