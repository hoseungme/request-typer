import { expect } from "chai";

import { Schema } from "../schema";

describe("Schema", () => {
  describe("Schema.Number", () => {
    it("should return NumberType object", () => {
      const schema = Schema.Number();
      expect(schema.type).to.be.eq("number");
    });
  });

  describe("Schema.String", () => {
    it("should return StringType object", () => {
      const schema = Schema.String();
      expect(schema.type).to.be.eq("string");
    });
  });

  describe("Schema.Boolean", () => {
    it("should return BooleanType object", () => {
      const schema = Schema.Boolean();
      expect(schema.type).to.be.eq("boolean");
    });
  });

  describe("Schema.Null", () => {
    it("should return NullType object", () => {
      const schema = Schema.Null();
      expect(schema.type).to.be.eq("null");
    });
  });

  describe("Schema.Enum", () => {
    it("should return EnumType object", () => {
      const schema = Schema.Enum(["a", "b", "c"]);
      expect(schema.type).to.be.eq("enum");
      expect(schema.values).to.be.deep.eq(["a", "b", "c"]);
    });
  });

  describe("Schema.Array", () => {
    context("when NumberType is passed", () => {
      it("should return ArrayType<NumberType> object", () => {
        const schema = Schema.Array(Schema.Number());
        expect(schema.type).to.be.eq("array");
        expect(schema.itemType.type).to.be.eq("number");
      });
    });

    context("when StringType is passed", () => {
      it("should return ArrayType<StringType> object", () => {
        const schema = Schema.Array(Schema.String());
        expect(schema.type).to.be.eq("array");
        expect(schema.itemType.type).to.be.eq("string");
      });
    });

    context("when BooleanType is passed", () => {
      it("should return ArrayType<BooleanType> object", () => {
        const schema = Schema.Array(Schema.Boolean());
        expect(schema.type).to.be.eq("array");
        expect(schema.itemType.type).to.be.eq("boolean");
      });
    });

    context("when ObjectType is passed", () => {
      it("should return ArrayType<ObjectType> object", () => {
        const schema = Schema.Array(Schema.Object({}));
        expect(schema.type).to.be.eq("array");
        expect(schema.itemType.type).to.be.eq("object");
      });
    });

    context("when UnionType is passed", () => {
      it("should return ArrayType<UnionType> object", () => {
        const schema = Schema.Array(Schema.Union([]));
        expect(schema.type).to.be.eq("array");
        expect(schema.itemType.type).to.be.eq("union");
      });
    });
  });

  describe("Schema.Object", () => {
    it("should return ObjectType object", () => {
      const schema = Schema.Object({
        number: Schema.Number(),
        string: Schema.String(),
        boolean: Schema.Boolean(),
        array: Schema.Array(Schema.Number()),
        object: Schema.Object({}),
        union: Schema.Union([]),
        optional: Schema.Optional(Schema.Number()),
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
      const schema = Schema.Optional(Schema.Number());
      expect(schema.type).to.be.eq("number");
      expect(schema.options.optional).to.be.true;
    });
  });

  describe("Schema.Union", () => {
    it("should return UnionType object", () => {
      const schema = Schema.Union([
        Schema.Number(),
        Schema.String(),
        Schema.Boolean(),
        Schema.Array(Schema.Number()),
        Schema.Object({}),
        Schema.Union([]),
      ]);
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
