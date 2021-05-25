import * as LevelName from "../LevelName";

interface TestData {
  currentPoint: string;
  referencePoint: string;
  expectResult: string;
}

const list: TestData[] = [
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/StringType",
    expectResult: "Schemas.StringType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/NumberType",
    expectResult: "Schemas.NumberType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/BooleanType",
    expectResult: "Schemas.BooleanType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/BooleanType",
    expectResult: "Schemas.BooleanType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/ObjectHasPropertiesType",
    expectResult: "Schemas.ObjectHasPropertiesType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/StringType",
    expectResult: "Schemas.StringType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/NumberType",
    expectResult: "Schemas.NumberType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/BooleanType",
    expectResult: "Schemas.BooleanType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/BooleanType",
    expectResult: "Schemas.BooleanType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/ObjectHasPropertiesType",
    expectResult: "Schemas.ObjectHasPropertiesType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/StringType",
    expectResult: "Schemas.StringType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/NumberType",
    expectResult: "Schemas.NumberType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/ObjectHasPropertiesType",
    expectResult: "Schemas.ObjectHasPropertiesType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/LocalRefObjectProperties",
    expectResult: "Schemas.LocalRefObjectProperties",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/StringType",
    expectResult: "Schemas.StringType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/NumberType",
    expectResult: "Schemas.NumberType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/ObjectHasPropertiesType",
    expectResult: "Schemas.ObjectHasPropertiesType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/LocalRefObjectProperties",
    expectResult: "Schemas.LocalRefObjectProperties",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/UnresolvedTarget1",
    expectResult: "Schemas.UnresolvedTarget1",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/UnresolvedTarget2",
    expectResult: "Schemas.UnresolvedTarget2",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/UnresolvedTarget3",
    expectResult: "Schemas.UnresolvedTarget3",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/UnresolvedTarget4",
    expectResult: "Schemas.UnresolvedTarget4",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/UnresolvedTarget5",
    expectResult: "Schemas.UnresolvedTarget5",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/RemoteString",
    expectResult: "Schemas.RemoteString",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/Level1/RemoteBoolean",
    expectResult: "Schemas.Level1.RemoteBoolean",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/Level1/Level2/RemoteNumber",
    expectResult: "Schemas.Level1.Level2.RemoteNumber",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/Level1/Level2/Level3/RemoteArray",
    expectResult: "Schemas.Level1.Level2.Level3.RemoteArray",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/Level1/Level2/Level3/Level4/RemoteObject",
    expectResult: "Schemas.Level1.Level2.Level3.Level4.RemoteObject",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/DirectRef/ForHeader",
    expectResult: "Schemas.DirectRef.ForHeader",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/StringDateTimeType",
    expectResult: "Schemas.StringDateTimeType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/ObjectHasPropertiesType",
    expectResult: "Schemas.ObjectHasPropertiesType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/DirectRef/ForResponse",
    expectResult: "Schemas.DirectRef.ForResponse",
  },
  {
    currentPoint: "test/api.test.domain/components/responses/ResponseA.yml",
    referencePoint: "components/headers/A",
    expectResult: "Headers.A",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/parameters/A",
    expectResult: "Parameters.A",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/parameters/level1/B",
    expectResult: "Parameters.level1.B",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/DirectRef/ForParameters",
    expectResult: "Schemas.DirectRef.ForParameters",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/StringHasEnumType",
    expectResult: "Schemas.StringHasEnumType",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/DirectRef/ForRequestBody",
    expectResult: "Schemas.DirectRef.ForRequestBody",
  },
  {
    currentPoint: "test/api.test.domain/components/parameters/ForPathItems/FullRemoteReference.yml",
    referencePoint: "components/schemas/FullRemoteReference/ForParameters",
    expectResult: "Schemas.FullRemoteReference.ForParameters",
  },
  {
    currentPoint: "testls /api.test.domain/components/responses/ForPathItems/FullRemoteReference.yml",
    referencePoint: "components/headers/A",
    expectResult: "Headers.A",
  },
  {
    currentPoint: "test/api.test.domain/components/schemas/Item.yml",
    referencePoint: "components/schemas/Child",
    expectResult: "Child",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/Item",
    expectResult: "Schemas.Item",
  },
  {
    currentPoint: "test/api.test.domain/index.yml",
    referencePoint: "components/schemas/ObjectHasPropertiesType",
    expectResult: "Schemas.ObjectHasPropertiesType",
  },
];

describe("Create Alias Name", () => {
  test("LevelName", () => {
    const entryPoint = "test/api.test.domain/index.yml";
    list.forEach(item => {
      expect(LevelName.makeAliasName(entryPoint, item.currentPoint, item.referencePoint)).toBe(item.expectResult);
    });
  });
});
