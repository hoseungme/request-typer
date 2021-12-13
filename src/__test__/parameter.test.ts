import { expect } from "chai";

import { Parameter } from "../Parameter";
import { Schema } from "../schema";

describe("Parameter", () => {
  describe("Parameter.Query", () => {
    it("should return QueryParamter object", () => {
      const parameter = Parameter.Query(Schema.Number());
      expect(parameter.type).to.be.eq("query");
      expect(parameter.schema.type).to.be.eq("number");
    });
  });

  describe("Parameter.Path", () => {
    it("should return PathParameter object", () => {
      const parameter = Parameter.Path(Schema.String());
      expect(parameter.type).to.be.eq("path");
      expect(parameter.schema.type).to.be.eq("string");
    });
  });

  describe("Parameter.Body", () => {
    it("should return RequestBody object", () => {
      const parameter = Parameter.Body(
        Schema.Object({
          a: Schema.Number(),
          b: Schema.Boolean(),
        })
      );
      expect(parameter.type).to.be.eq("body");
      expect(parameter.schema.type).to.be.eq("object");
      expect(parameter.schema.properties.a.type).to.be.eq("number");
      expect(parameter.schema.properties.b.type).to.be.eq("boolean");
    });
  });
});
