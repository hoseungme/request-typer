import { OpenAPIV3 } from "openapi-types";

import { AllSchema } from "./schema";
import { HTTPRequest, Method, Parameters, ResponseBody } from "./http";

export class OASBuilder {
  private readonly responseSchemaKeyValuePairs: [string, ResponseBody][] = [];

  constructor(
    private readonly info: OpenAPIV3.InfoObject,
    private readonly httpRequestSchemas: HTTPRequest<Method, Parameters, ResponseBody>[],
    responseSchemas: Record<string, ResponseBody> = {}
  ) {
    Object.keys(responseSchemas).forEach((key) => {
      this.responseSchemaKeyValuePairs.push([key, responseSchemas[key]]);
    });
  }

  public build(): OpenAPIV3.Document {
    return {
      openapi: "3.0.1",
      info: this.info,
      paths: this.createPaths(),
      components: this.createComponents(),
    };
  }

  private createPaths(): OpenAPIV3.PathsObject {
    const paths: OpenAPIV3.PathsObject = {};
    this.httpRequestSchemas.forEach((request) => {
      paths[request.path] = {
        ...(paths[request.path] ?? {}),
        [request.method]: this.createOperation(request),
      };
    });
    return paths;
  }

  private createComponents(): OpenAPIV3.ComponentsObject {
    const schemas: NonNullable<OpenAPIV3.ComponentsObject["schemas"]> = {};
    this.responseSchemaKeyValuePairs.forEach(([key, value]) => {
      schemas[key] = this.createSchema(value);
    });
    return { schemas };
  }

  private createOperation(requestSchema: HTTPRequest<Method, Parameters, ResponseBody>): OpenAPIV3.OperationObject {
    const keys = Object.keys(requestSchema.parameters);
    const parameterKeys = keys.filter((key) => requestSchema.parameters[key].type !== "body");
    const requestBodyKeys = keys.filter((key) => requestSchema.parameters[key].type === "body");

    const parameters =
      parameterKeys.length > 0
        ? parameterKeys.map((key) => {
            const parameter = requestSchema.parameters[key];
            return {
              required: parameter.type === "query" ? !parameter.schema.options.optional : true,
              name: key,
              in: parameter.type,
              schema: this.createSchema(parameter.schema),
            };
          })
        : undefined;

    const requestBody =
      requestBodyKeys.length > 0
        ? {
            required: true,
            content: {
              "application/json": {
                schema: this.createSchema({
                  type: "object",
                  properties: (() => {
                    const result: Record<string, any> = {};
                    requestBodyKeys.forEach((key) => {
                      result[key] = requestSchema.parameters[key].schema;
                    });
                    return result;
                  })(),
                  options: {},
                  definition: "",
                }),
              },
            },
          }
        : undefined;

    return {
      operationId: requestSchema.operationId,
      ...(parameters ? { parameters } : {}),
      ...(requestBody ? { requestBody } : {}),
      responses: {
        200: {
          description: "success",
          content: {
            "application/json": {
              schema: (() => {
                console.log(requestSchema)
                const schemaName = this.getResponseBodySchemaName(requestSchema.response);
                return schemaName
                  ? {
                      $ref: `#/components/schemas/${schemaName}`,
                    }
                  : this.createSchema(requestSchema.response);
              })(),
            },
          },
        },
      },
    };
  }

  private createSchema(schema: AllSchema): OpenAPIV3.SchemaObject {
    console.log(schema)
    const nullable = schema.options.nullable;
    switch (schema.type) {
      case "number": {
        return { type: "number", ...(nullable ? { nullable } : {}) };
      }
      case "string": {
        return { type: "string", ...(nullable ? { nullable } : {}) };
      }
      case "boolean": {
        return { type: "boolean", ...(nullable ? { nullable } : {}) };
      }
      case "array": {
        return { type: "array", items: this.createSchema(schema.itemSchema), ...(nullable ? { nullable } : {}) };
      }
      case "object": {
        const properties: NonNullable<OpenAPIV3.SchemaObject["properties"]> = {};

        const keys = Object.keys(schema.properties);
        keys.forEach((key) => {
          properties[key] = this.createSchema(schema.properties[key]);
        });

        return {
          type: "object",
          properties,
          required: keys.filter((key) => !schema.properties[key].options.optional),
          ...(nullable ? { nullable } : {}),
        };
      }
      case "union": {
        return { anyOf: schema.itemSchemas.map(this.createSchema), ...(nullable ? { nullable } : {}) };
      }
      case "enum": {
        return { type: "string", enum: schema.values, ...(nullable ? { nullable } : {}) };
      }
      case "dict": {
        return { type: "object", additionalProperties: this.createSchema(schema.valueSchema) };
      }
    }
  }

  private getResponseBodySchemaName(responseBody: ResponseBody): string | null {
    return this.responseSchemaKeyValuePairs.find(([, value]) => value === responseBody)?.[0] ?? null;
  }
}
