import { expect } from "chai";

import { HTTP } from "../http";
import { Parameter } from "../Parameter";
import { Schema } from "../schema";

describe("HTTP", () => {
  describe("HTTP.GET", () => {
    it("should return Request object", () => {
      const request = HTTP.GET(
        "getUser",
        "/users/:id",
        {
          id: Parameter.Path(Schema.String()),
        },
        {
          user: Schema.Object({ id: Schema.String() }),
        }
      );
      expect(request.method).to.be.eq("get");
      expect(request.operationId).to.be.eq("getUser");
      expect(request.path).to.be.eq("/users/:id");
      expect(request.parameters.id.type).to.be.eq("path");
      expect(request.parameters.id.schema.type).to.be.eq("string");
      expect(request.response.user.type).to.be.eq("object");
      expect(request.response.user.properties.id.type).to.be.eq("string");
    });
  });

  describe("HTTP.POST", () => {
    it("should return Request object", () => {
      const request = HTTP.POST(
        "createUser",
        "/users",
        {
          id: Parameter.Body(Schema.String()),
        },
        {
          user: Schema.Object({ id: Schema.String() }),
        }
      );
      expect(request.method).to.be.eq("post");
      expect(request.operationId).to.be.eq("createUser");
      expect(request.path).to.be.eq("/users");
      expect(request.parameters.id.type).to.be.eq("body");
      expect(request.parameters.id.schema.type).to.be.eq("string");
      expect(request.response.user.type).to.be.eq("object");
      expect(request.response.user.properties.id.type).to.be.eq("string");
    });
  });

  describe("HTTP.PUT", () => {
    it("should return Request object", () => {
      const request = HTTP.PUT(
        "updateUser",
        "/users/:id",
        {
          id: Parameter.Path(Schema.String()),
        },
        {
          user: Schema.Object({ id: Schema.String() }),
        }
      );
      expect(request.method).to.be.eq("put");
      expect(request.operationId).to.be.eq("updateUser");
      expect(request.path).to.be.eq("/users/:id");
      expect(request.parameters.id.type).to.be.eq("path");
      expect(request.parameters.id.schema.type).to.be.eq("string");
      expect(request.response.user.type).to.be.eq("object");
      expect(request.response.user.properties.id.type).to.be.eq("string");
    });
  });
  
  describe("HTTP.PATCH", () => {
    it("should return Request object", () => {
      const request = HTTP.PATCH(
        "updateUser",
        "/users/:id",
        {
          id: Parameter.Path(Schema.String()),
        },
        {
          user: Schema.Object({ id: Schema.String() }),
        }
      );
      expect(request.method).to.be.eq("patch");
      expect(request.operationId).to.be.eq("updateUser");
      expect(request.path).to.be.eq("/users/:id");
      expect(request.parameters.id.type).to.be.eq("path");
      expect(request.parameters.id.schema.type).to.be.eq("string");
      expect(request.response.user.type).to.be.eq("object");
      expect(request.response.user.properties.id.type).to.be.eq("string");
    });
  });

  describe("HTTP.DELETE", () => {
    it("should return Request object", () => {
      const request = HTTP.DELETE(
        "deleteUser",
        "/users/:id",
        {
          id: Parameter.Path(Schema.String()),
        },
        {
          success: Schema.Boolean(),
        }
      );
      expect(request.method).to.be.eq("delete");
      expect(request.operationId).to.be.eq("deleteUser");
      expect(request.path).to.be.eq("/users/:id");
      expect(request.parameters.id.type).to.be.eq("path");
      expect(request.parameters.id.schema.type).to.be.eq("string");
      expect(request.response.success.type).to.be.eq("boolean");
    });
  });
});
