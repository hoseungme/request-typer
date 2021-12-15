import { expect } from "chai";

import { OASBuilder } from "../OASBuilder";
import { HTTP, Parameter, Schema } from "..";

describe("OASBuilder", () => {
  describe("OASBuilder.build", () => {
    it("should create correct OpenAPI Specification", () => {
      const Responses = {
        User: {
          id: Schema.String(),
          name: Schema.String(),
          gender: Schema.Nullable(Schema.Enum(["men", "women"])),
          email: Schema.Optional(Schema.String()),
        },
      };

      const httpRequestSchemas = [
        HTTP.GET(
          "getUser",
          "/user/{id}",
          {
            id: Parameter.Path(Schema.String()),
          },
          Responses.User
        ),
        HTTP.POST(
          "createUser",
          "/user",
          {
            name: Parameter.Body(Schema.String()),
          },
          Responses.User
        ),
        HTTP.PATCH(
          "updateUser",
          "/user/{id}",
          {
            id: Parameter.Path(Schema.String()),
            name: Parameter.Body(Schema.String()),
          },
          Responses.User
        ),
      ];

      const oas = new OASBuilder({ title: "api-v1", version: "1.0.0" }, httpRequestSchemas, Responses).build();

      expect(oas).to.be.deep.eq({
        info: {
          title: "api-v1",
          version: "1.0.0",
        },
        openapi: "3.0.1",
        paths: {
          "/user": {
            post: {
              operationId: "createUser",
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                      },
                      required: ["name"],
                    },
                  },
                },
              },
              responses: {
                200: {
                  description: "success",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                  },
                },
              },
            },
          },
          "/user/{id}": {
            get: {
              operationId: "getUser",
              parameters: [
                {
                  required: true,
                  name: "id",
                  in: "path",
                  schema: {
                    type: "string",
                  },
                },
              ],
              responses: {
                200: {
                  description: "success",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                  },
                },
              },
            },
            patch: {
              operationId: "updateUser",
              parameters: [
                {
                  required: true,
                  name: "id",
                  in: "path",
                  schema: {
                    type: "string",
                  },
                },
              ],
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                      },
                      required: ["name"],
                    },
                  },
                },
              },
              responses: {
                200: {
                  description: "success",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            User: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                gender: { type: "string", enum: ["men", "women"], nullable: true },
                email: { type: "string" },
              },
              required: ["id", "name", "gender"],
            },
          },
        },
      });
    });
  });
});
