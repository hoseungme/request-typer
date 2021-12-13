import { expect } from "chai";

import { S } from "../schema";

describe("Schema", () => {
  describe("Schema.Number", () => {
    it("should return NumberType object", () => {
      const schema = S.Number();
      expect(schema.type).to.be.eq("number");
    });
  });

  describe("Schema.String", () => {
    it("should return StringType object", () => {
      const schema = S.String();
      expect(schema.type).to.be.eq("string");
    });
  });

  describe("Schema.Boolean", () => {
    it("should return BooleanType object", () => {
      const schema = S.Boolean();
      expect(schema.type).to.be.eq("boolean");
    });
  });

  describe("Schema.Null", () => {
    it("should return NullType object", () => {
      const schema = S.Null();
      expect(schema.type).to.be.eq("null");
    });
  });

  describe("Schema.Array", () => {
    context("when NumberType is passed", () => {
      it("should return ArrayType<NumberType> object", () => {
        const schema = S.Array(S.Number());
        expect(schema.type).to.be.eq("array");
        expect(schema.itemType.type).to.be.eq("number");
      });
    });

    context("when StringType is passed", () => {
      it("should return ArrayType<StringType> object", () => {
        const schema = S.Array(S.String());
        expect(schema.type).to.be.eq("array");
        expect(schema.itemType.type).to.be.eq("string");
      });
    });

    context("when BooleanType is passed", () => {
      it("should return ArrayType<BooleanType> object", () => {
        const schema = S.Array(S.Boolean());
        expect(schema.type).to.be.eq("array");
        expect(schema.itemType.type).to.be.eq("boolean");
      });
    });

    context("when ObjectType is passed", () => {
      it("should return ArrayType<ObjectType> object", () => {
        const schema = S.Array(S.Object({}));
        expect(schema.type).to.be.eq("array");
        expect(schema.itemType.type).to.be.eq("object");
      });
    });

    context("when UnionType is passed", () => {
      it("should return ArrayType<UnionType> object", () => {
        const schema = S.Array(S.Union([]));
        expect(schema.type).to.be.eq("array");
        expect(schema.itemType.type).to.be.eq("union");
      });
    });
  });

  describe("Schema.Object", () => {
    it("should return ObjectType object", () => {
      const schema = S.Object({
        number: S.Number(),
        string: S.String(),
        boolean: S.Boolean(),
        array: S.Array(S.Number()),
        object: S.Object({}),
        union: S.Union([]),
        optional: S.Optional(S.Number()),
      });

      expect(schema.type).to.be.eq("object");
      expect(schema.properties.number.type).to.be.eq("number");
      expect(schema.properties.string.type).to.be.eq("string");
      expect(schema.properties.boolean.type).to.be.eq("boolean");
      expect(schema.properties.array.type).to.be.eq("array");
      expect(schema.properties.object.type).to.be.eq("object");
      expect(schema.properties.union.type).to.be.eq("union");
      expect(schema.properties.optional.options.optional).to.be.true;
    });
  });

  describe("Schema.Optional", () => {
    it("should set Type.optional option to true", () => {
      const schema = S.Optional(S.Number());
      expect(schema.type).to.be.eq("number");
      expect(schema.options.optional).to.be.true;
    });
  });

  describe("Schema.Union", () => {
    it("should return UnionType object", () => {
      const schema = S.Union([S.Number(), S.String(), S.Boolean(), S.Array(S.Number()), S.Object({}), S.Union([])]);
      expect(schema.type).to.be.eq("union");
      expect(schema.itemTypes.map(({ type }) => type)).to.be.deep.eq([
        "number",
        "string",
        "boolean",
        "array",
        "object",
        "union",
      ]);
    });
  });
});
