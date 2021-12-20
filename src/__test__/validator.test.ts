import { expect } from "chai";

import { Validator, Schema } from "..";

describe("Validator", () => {
  describe("Validator.validate", () => {
    context("when NumberSchema is passed", () => {
      const schema = Schema.Number();

      it("should return success result if value is evaluated as number", () => {
        expect(Validator.validate(schema, 1234).success).to.be.true;
      });

      it("should return failed result if value isn't evaluated as number", () => {
        const result = Validator.validate(schema, "1234");
        expect(result.success).to.be.false;
        expect(result.success === false && result.error.description).to.be.eq("should be number");
      });
    });

    context("when StringSchema is passed", () => {
      const schema = Schema.String();

      it("should return success result if value is evaluated as string", () => {
        expect(Validator.validate(schema, "1234").success).to.be.true;
      });

      it("should return failed result if value isn't evaluated as string", () => {
        const result = Validator.validate(schema, 1234);
        expect(result.success).to.be.false;
        expect(result.success === false && result.error.description).to.be.eq("should be string");
      });
    });

    context("when BooleanSchema is passed", () => {
      const schema = Schema.Boolean();

      it("should return success result if value is evaluated as boolean", () => {
        expect(Validator.validate(schema, true).success).to.be.true;
        expect(Validator.validate(schema, false).success).to.be.true;
      });

      it("should return failed result if value isn't evaluated as boolean", () => {
        const result = Validator.validate(schema, 1);
        expect(result.success).to.be.false;
        expect(result.success === false && result.error.description).to.be.eq("should be boolean");
      });
    });

    context("when EnumSchema is passed", () => {
      const schema = Schema.Enum(["a", "b", "c"]);

      it("should return success result if value is evaluated as enum", () => {
        expect(Validator.validate(schema, "a").success).to.be.true;
        expect(Validator.validate(schema, "b").success).to.be.true;
        expect(Validator.validate(schema, "c").success).to.be.true;
      });

      it("should return failed result if value isn't evaluated as enum", () => {
        const result = Validator.validate(schema, "d");
        expect(result.success).to.be.false;
        expect(result.success === false && result.error.description).to.be.eq(`should be one of "a" | "b" | "c"`);
      });
    });

    context("when ArraySchema is passed", () => {
      const schema = Schema.Array(Schema.Number());

      it("should return success result if value is evaluated as array", () => {
        expect(Validator.validate(schema, [1, 2, 3, 4]).success).to.be.true;
      });

      it("should return failed result if value isn't evaluated as array", () => {
        const result = Validator.validate(schema, ["1", "2", "3", 4, 5]);
        expect(result.success).to.be.false;
        expect(result.success === false && result.error.description).to.be.eq("should be Array<number>");
      });
    });

    context("when UnionSchema is passed", () => {
      const schema = Schema.Union([Schema.Number(), Schema.String()]);

      it("should return success result if value is evaluated as union", () => {
        expect(Validator.validate(schema, 1234).success).to.be.true;
        expect(Validator.validate(schema, "1234").success).to.be.true;
      });

      it("should return failed result if value isn't evaluated as union", () => {
        const result = Validator.validate(schema, true);
        expect(result.success).to.be.false;
        expect(result.success === false && result.error.description).to.be.eq("should be number | string");
      });
    });

    context("when ObjectSchema is passed", () => {
      const schema = Schema.Object({ number: Schema.Number(), optional: Schema.Optional(Schema.String()) });

      it("should return success result if value is evaluated as union", () => {
        expect(Validator.validate(schema, { number: 1234 }).success).to.be.true;
        expect(Validator.validate(schema, { number: 1234, optional: "1234" }).success).to.be.true;
      });

      it("should return failed result if value isn't evaluated as union", () => {
        expect(Validator.validate(schema, {}).success).to.be.false;
        expect(Validator.validate(schema, []).success).to.be.false;
        expect(Validator.validate(schema, null).success).to.be.false;
        expect(Validator.validate(schema, { number: "1234" }).success).to.be.false;
        expect(Validator.validate(schema, { number: 1234, optional: 1234 }).success).to.be.false;

        const result = Validator.validate(schema, { optional: true });
        expect(result.success).to.be.false;
        expect(result.success === false && result.error.description).to.be.eq(
          "property [number]: should be provided, property [optional]: should be string"
        );
      });
    });

    context("when DictSchema is passed", () => {
      const schema = Schema.Dict(Schema.String());

      it("should return success result if value is evaluated as dict", () => {
        expect(Validator.validate(schema, { a: "1234", b: "1234" }).success).to.be.true;
        expect(Validator.validate(schema, {}).success).to.be.true;
      });

      it("should return failed result if value isn't evaluated as dict", () => {
        const result = Validator.validate(schema, { a: 1234, b: "1234" });
        expect(result.success).to.be.false;
        expect(result.success === false && result.error.description).to.be.eq("should be { [key: string]: string }");
      });
    });
  });
});
