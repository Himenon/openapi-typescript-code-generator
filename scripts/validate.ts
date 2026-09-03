import * as fs from "node:fs";
import { createRequire } from "node:module";
import * as path from "node:path";
import * as yaml from "js-yaml";

const require = createRequire(import.meta.url);
const OpenAPISchemaValidator = require("openapi-schema-validator").default;

const filename = path.join(import.meta.dirname, "../test/api.test.domain/index.yml");
const data = fs.readFileSync(filename, { encoding: "utf-8" });

const validator = new OpenAPISchemaValidator({
  version: 3,
  // optional
  extensions: {
    /* place any properties here to extend the schema. */
  },
});

const message = validator.validate(yaml.load(data) as any);

const outputFilename = path.join(import.meta.dirname, "../debug/validate.json");
fs.mkdirSync(path.dirname(outputFilename), { recursive: true });
fs.writeFileSync(outputFilename, `${JSON.stringify(message, null, 2)}\n`, { encoding: "utf-8" });
