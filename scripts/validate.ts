import * as fs from "fs";
import * as path from "path";

import * as yaml from "js-yaml";
import OpenAPISchemaValidator from "openapi-schema-validator";

const filename = path.join(__dirname, "../test/api.test.domain/index.yml");
const data = fs.readFileSync(filename, { encoding: "utf-8" });

const validator = new OpenAPISchemaValidator({
  version: 3,
  // optional
  extensions: {
    /* place any properties here to extend the schema. */
  },
});

const message = validator.validate(yaml.safeLoad(data) as any);

fs.writeFileSync(path.join(__dirname, "../debug/validate.json"), JSON.stringify(message, null, 2), { encoding: "utf-8" });
