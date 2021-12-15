import { expect } from "chai";

import { Validator } from "../validator";
import { Schema } from "../schema";

describe("Validator", () => {
  describe("Validator.validate", () => {
    context("when NumberType is passed", () => {
      const schema = Schema.Number();

      it("should return true if value is evaluated as number", () => {
        expect(Validator.validate(schema, 1234)).to.be.true;
      });

      it("should return false if value isn't evaluated as number", () => {
        expect(Validator.validate(schema, "1234")).to.be.false;
      });
    });

    context("when StringType is passed", () => {
      const schema = Schema.String();

      it("should return true if value is evaluated as string", () => {
        expect(Validator.validate(schema, "1234")).to.be.true;
      });

      it("should return false if value isn't evaluated as string", () => {
        expect(Validator.validate(schema, 1234)).to.be.false;
      });
    });

    context("when BooleanType is passed", () => {
      const schema = Schema.Boolean();

      it("should return true if value is evaluated as boolean", () => {
        expect(Validator.validate(schema, true)).to.be.true;
        expect(Validator.validate(schema, false)).to.be.true;
      });

      it("should return false if value isn't evaluated as boolean", () => {
        expect(Validator.validate(schema, "1234")).to.be.false;
      });
    });

    context("when EnumType is passed", () => {
      const schema = Schema.Enum(["a", "b", "c"]);

      it("should return true if value is evaluated as enum", () => {
        expect(Validator.validate(schema, "a")).to.be.true;
        expect(Validator.validate(schema, "b")).to.be.true;
        expect(Validator.validate(schema, "c")).to.be.true;
      });

      it("should return false if value isn't evaluated as enum", () => {
        expect(Validator.validate(schema, "1234")).to.be.false;
      });
    });

    context("when ArrayType is passed", () => {
      const schema = Schema.Array(Schema.Number());

      it("should return true if value is evaluated as array", () => {
        expect(Validator.validate(schema, [1, 2, 3, 4])).to.be.true;
      });

      it("should return false if value isn't evaluated as array", () => {
        expect(Validator.validate(schema, ["a", "b", "c", "d"])).to.be.false;
        expect(Validator.validate(schema, "1234")).to.be.false;
      });
    });

    context("when UnionType is passed", () => {
      const schema = Schema.Union([Schema.Number(), Schema.String()]);

      it("should return true if value is evaluated as union", () => {
        expect(Validator.validate(schema, 1234)).to.be.true;
        expect(Validator.validate(schema, "1234")).to.be.true;
      });

      it("should return false if value isn't evaluated as union", () => {
        expect(Validator.validate(schema, [])).to.be.false;
        expect(Validator.validate(schema, {})).to.be.false;
      });
    });

    context("when ObjectType is passed", () => {
      const schema = Schema.Object({ number: Schema.Number(), optional: Schema.Optional(Schema.String()) });

      it("should return true if value is evaluated as union", () => {
        expect(Validator.validate(schema, { number: 1234 })).to.be.true;
        expect(Validator.validate(schema, { number: 1234, optional: "1234" })).to.be.true;
      });

      it("should return false if value isn't evaluated as union", () => {
        expect(Validator.validate(schema, {})).to.be.false;
        expect(Validator.validate(schema, [])).to.be.false;
        expect(Validator.validate(schema, null)).to.be.false;
        expect(Validator.validate(schema, { number: "1234" })).to.be.false;
        expect(Validator.validate(schema, { number: 1234, optional: 1234 })).to.be.false;
      });
    });
  });
});
