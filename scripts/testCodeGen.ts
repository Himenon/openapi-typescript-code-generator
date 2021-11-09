import * as Writer from "./writer";

const main = () => {
  Writer.generateTypedefCodeOnly("test/api.test.domain/index.yml", "test/code/typedef-only/api.test.domain.ts", true);
  Writer.generateTypedefCodeOnly("test/infer.domain/index.yml", "test/code/typedef-only/infer.domain.ts", false);

  Writer.generateTemplateCodeOnly("test/api.test.domain/index.yml", "test/code/template-only/api.test.domain.ts", true, { sync: false });
  Writer.generateTemplateCodeOnly("test/api.test.domain/index.yml", "test/code/template-only/sync-api.test.domain.ts", true, { sync: true });
  Writer.generateTemplateCodeOnly("test/infer.domain/index.yml", "test/code/template-only/infer.domain.ts", false, { sync: true });

  Writer.generateTypedefWithTemplateCode("test/api.v2.domain/index.yml", "test/code/typedef-with-template/api.v2.domain.ts", false, {
    sync: false,
  });
  Writer.generateTypedefWithTemplateCode("test/api.test.domain/index.yml", "test/code/typedef-with-template/api.test.domain.ts", true, {
    sync: false,
  });
  Writer.generateTypedefWithTemplateCode("test/api.test.domain/index.yml", "test/code/typedef-with-template/sync-api.test.domain.ts", true, {
    sync: true,
  });
  Writer.generateTypedefWithTemplateCode("test/infer.domain/index.yml", "test/code/typedef-with-template/infer.domain.ts", false, {
    sync: false,
  });

  Writer.generateTypedefWithTemplateCode("test/ref.access/index.yml", "test/code/typedef-with-template/ref-access.ts", false, {
    sync: false,
  });
  Writer.generateTypedefWithTemplateCode("test/kubernetes/openapi-v1.18.5.json", "test/code/kubernetes/client-v1.18.5.ts", false, {
    sync: false,
  });
  Writer.generateTypedefWithTemplateCode("test/argo-rollout/index.json", "test/code/argo-rollout/client.ts", false, {
    sync: false,
  });

  Writer.generateSplitCode("test/api.test.domain/index.yml", "test/code/split");

  Writer.generateParameter("test/api.test.domain/index.yml", "test/code/parameter/api.test.domain.json");
  Writer.generateParameter("test/infer.domain/index.yml", "test/code/parameter/infer.domain.json");

  Writer.generateFormatTypeCode("test/format.domain/index.yml", "test/code/format.domain/code.ts");
};

main();
