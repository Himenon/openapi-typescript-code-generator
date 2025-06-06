import * as Writer from "./writer/Functional.js";

const main = () => {
  Writer.generateTypedefCodeOnly("test/api.test.domain/index.yml", "test/code/functional/typedef-only/api.test.domain.ts", true);
  Writer.generateTypedefCodeOnly("test/infer.domain/index.yml", "test/code/functional/typedef-only/infer.domain.ts", false);
  Writer.generateTypedefCodeOnly("test/json.properties/index.yml", "test/code/functional/typedef-only/json.properties.ts", false);

  Writer.generateTemplateCodeOnly("test/api.test.domain/index.yml", "test/code/functional/template-only/api.test.domain.ts", true, {
    sync: false,
  });
  Writer.generateTemplateCodeOnly("test/api.test.domain/index.yml", "test/code/functional/template-only/sync-api.test.domain.ts", true, {
    sync: true,
  });
  Writer.generateTemplateCodeOnly("test/infer.domain/index.yml", "test/code/functional/template-only/infer.domain.ts", false, {
    sync: true,
  });

  Writer.generateTypedefWithTemplateCode("test/api.v2.domain/index.yml", "test/code/functional/typedef-with-template/api.v2.domain.ts", false, {
    sync: false,
  });
  Writer.generateTypedefWithTemplateCode(
    "test/api.test.domain/index.yml",
    "test/code/functional/typedef-with-template/api.test.domain.ts",
    true,
    {
      sync: false,
    },
  );
  Writer.generateTypedefWithTemplateCode(
    "test/api.test.domain/index.yml",
    "test/code/functional/typedef-with-template/sync-api.test.domain.ts",
    true,
    {
      sync: true,
    },
  );
  Writer.generateTypedefWithTemplateCode("test/infer.domain/index.yml", "test/code/functional/typedef-with-template/infer.domain.ts", false, {
    sync: false,
  });

  Writer.generateTypedefWithTemplateCode("test/ref.access/index.yml", "test/code/functional/typedef-with-template/ref-access.ts", false, {
    sync: false,
  });
  Writer.generateTypedefWithTemplateCode(
    "test/remote.ref.access/v1.yml",
    "test/code/functional/typedef-with-template/remote-ref-access.ts",
    false,
    {
      sync: false,
    },
  );
  Writer.generateTypedefWithTemplateCode("test/kubernetes/openapi-v1.18.5.json", "test/code/functional/kubernetes/client-v1.18.5.ts", false, {
    sync: false,
  });
  Writer.generateTypedefWithTemplateCode("test/argo-rollout/index.json", "test/code/functional/argo-rollout/client.ts", false, {
    sync: false,
  });
  Writer.generateTypedefWithTemplateCode(
    "test/unknown.schema.domain/index.yml",
    "test/code/functional/unknown.schema.domain/client.ts",
    false,
    {
      sync: false,
    },
  );

  Writer.generateSplitCode("test/api.test.domain/index.yml", "test/code/functional/split");
  Writer.generateSplitCode("test/multi-type.test.domain/index.yml", "test/code/functional/mulit-type-test.domain");

  Writer.generateParameter("test/api.test.domain/index.yml", "test/code/functional/parameter/api.test.domain.json");
  Writer.generateParameter("test/infer.domain/index.yml", "test/code/functional/parameter/infer.domain.json");

  Writer.generateFormatTypeCode("test/format.domain/index.yml", "test/code/functional/format.domain/code.ts");

  Writer.generateFormatTypeCode("test/cloudflare/openapi.yaml", "test/code/functional/cloudflare/client.ts");
};

main();
