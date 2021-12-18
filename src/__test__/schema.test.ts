import { expect } from "chai";

import { Schema } from "../schema";

describe("Schema", () => {
  describe("Schema.Number", () => {
    it("should return NumberSchema object", () => {
      const schema = Schema.Number();
      expect(schema.type).to.be.eq("number");
    });
  });

  describe("Schema.String", () => {
    it("should return StringSchema object", () => {
      const schema = Schema.String();
      expect(schema.type).to.be.eq("string");
    });
  });

  describe("Schema.Boolean", () => {
    it("should return BooleanSchema object", () => {
      const schema = Schema.Boolean();
      expect(schema.type).to.be.eq("boolean");
    });
  });

  describe("Schema.Enum", () => {
    it("should return EnumSchema object", () => {
      const schema = Schema.Enum(["a", "b", "c"]);
      expect(schema.type).to.be.eq("enum");
      expect(schema.values).to.be.deep.eq(["a", "b", "c"]);
      expect(schema.definition).to.be.eq(`"a" | "b" | "c"`);
    });
  });

  describe("Schema.Array", () => {
    context("when NumberSchema is passed", () => {
      it("should return ArraySchema<NumberSchema> object", () => {
        const schema = Schema.Array(Schema.Number());
        expect(schema.type).to.be.eq("array");
        expect(schema.itemSchema.type).to.be.eq("number");
        expect(schema.definition).to.be.eq("Array<number>");
      });
    });

    context("when StringSchema is passed", () => {
      it("should return ArraySchema<StringSchema> object", () => {
        const schema = Schema.Array(Schema.String());
        expect(schema.type).to.be.eq("array");
        expect(schema.itemSchema.type).to.be.eq("string");
        expect(schema.definition).to.be.eq("Array<string>");
      });
    });

    context("when BooleanSchema is passed", () => {
      it("should return ArraySchema<BooleanSchema> object", () => {
        const schema = Schema.Array(Schema.Boolean());
        expect(schema.type).to.be.eq("array");
        expect(schema.itemSchema.type).to.be.eq("boolean");
        expect(schema.definition).to.be.eq("Array<boolean>");
      });
    });

    context("when ObjectSchema is passed", () => {
      it("should return ArraySchema<ObjectSchema> object", () => {
        const schema = Schema.Array(Schema.Object({}));
        expect(schema.type).to.be.eq("array");
        expect(schema.itemSchema.type).to.be.eq("object");
        expect(schema.definition).to.be.eq(`Array<{}>`);
      });
    });

    context("when UnionSchema is passed", () => {
      it("should return ArraySchema<UnionSchema> object", () => {
        const schema = Schema.Array(Schema.Union([Schema.Number(), Schema.String()]));
        expect(schema.type).to.be.eq("array");
        expect(schema.itemSchema.type).to.be.eq("union");
        expect(schema.definition).to.be.eq(`Array<number | string>`);
      });
    });
  });

  describe("Schema.Object", () => {
    it("should return ObjectSchema object", () => {
      const schema = Schema.Object({
        number: Schema.Number(),
        string: Schema.String(),
        boolean: Schema.Boolean(),
        array: Schema.Array(Schema.Number()),
        object: Schema.Object({}),
        union: Schema.Union([
          Schema.Number(),
          Schema.String(),
          Schema.Union([Schema.Number(), Schema.String(), Schema.Boolean()]),
        ]),
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
      expect(schema.definition).to.be.eq(
        `{ ${[
          "number: number",
          "string: string",
          "boolean: boolean",
          "array: Array<number>",
          "object: {}",
          "union: number | string | boolean",
          "optional?: number",
        ].join(", ")} }`
      );
    });
  });

  describe("Schema.Optional", () => {
    it("should set Schema.optional option to true", () => {
      const schema = Schema.Optional(Schema.Number());
      expect(schema.type).to.be.eq("number");
      expect(schema.options.optional).to.be.true;
    });
  });

  describe("Schema.Nullable", () => {
    it("should set Schema.nullable option to true", () => {
      const schema = Schema.Nullable(Schema.Number());
      expect(schema.type).to.be.eq("number");
      expect(schema.options.nullable).to.be.true;
    });
  });

  describe("Schema.Union", () => {
    it("should return UnionSchema object", () => {
      const schema = Schema.Union([
        Schema.Number(),
        Schema.String(),
        Schema.Union([Schema.Number(), Schema.String(), Schema.Boolean()]),
        Schema.Object({ a: Schema.String() }),
        Schema.Object({ a: Schema.Number() }),
        Schema.Object({ a: Schema.Number() }),
        Schema.Object({ a: Schema.Boolean() }),
      ]);
      expect(schema.type).to.be.eq("union");
      expect(schema.itemSchemas.map(({ type }) => type)).to.be.deep.eq([
        "number",
        "string",
        "boolean",
        "object",
        "object",
        "object",
      ]);
      expect(schema.definition).to.be.eq(`number | string | boolean | { a: string } | { a: number } | { a: boolean }`);
    });
  });
});
