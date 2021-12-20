# request-typer
[![npm version](https://badge.fury.io/js/request-typer.svg)](https://badge.fury.io/js/request-typer)
[![npm download](https://badgen.net/npm/dt/request-typer)](https://badgen.net/npm/dt/request-typer)

Make typed request schema and build OpenAPI Specification.

## Features
- [Schema](#schema)
- [Validator](#validator)
- [HTTP](#http)
- [OASBuilder](#oasbuilder)

## Schema
use ```Schema``` to create type definition.

```typescript
const user = Schema.Object({
  id: Schema.String(),
  name: Schema.String(),
  email: Schema.Optional(Schema.String()),
  gender: Schema.Nullable(Schema.Enum(["women", "men"])),
  createdAt: Schema.Number(),
});

const union = Schema.Union([
  Schema.Number(),
  Schema.String(),
  Schema.Union([
    Schema.Number(),
    Schema.String(),
    Schema.Bolean()
  ]),
]);
```

and it supports static type resolution. import ```Resolve```.

```typescript
const user = Schema.Object({
  id: Schema.String(),
  name: Schema.String(),
  email: Schema.Optional(Schema.String()),
  gender: Schema.Nullable(Schema.Enum(["women", "men"])),
  createdAt: Schema.Number(),
});

/*
{
  id: string;
  name: string;
  email?: string | undefined;
  gender: "women" | "men" | null;
  createdAt: number;
}
*/
type User = Resolve<typeof user>;
```

## Validator
use ```Validator``` to compare [Schema](#schema) with value.

it returns ```{ success: true }``` if validation succeeded. otherwise, it returns error which includes message.

```typescript
Validator.validate(Schema.Number(), 1234).success; // true

Validator.validate(Schema.Array(Schema.String()), [1, 2, 3, 4]).success; // false
Validator.validate(Schema.Array(Schema.String()), [1, 2, 3, 4]).error.description; // "should be Array<string>"
```

## HTTP
use ```HTTP``` to define HTTP request and response body schema.
use ```Parameter``` to define request parameter.

```typescript
/*
GET /users/:id
{
  user: {
    id: string
  }
}
*/
HTTP.GET(
  // unique ID for this request
  "getUser",
  // path
  "/users/:id",
  // request parameters
  {
    id: Parameter.Path(Schema.String()),
  },
  // response json schema
  Schema.Object({
    id: Schema.String(),
  }),
);
```

and it supports static type resolution for request parameters and response body.
```typescript
const request = HTTP.PUT(
  "updateUser",
  "/users/:id",
  {
    id: Parameter.Path(Schema.String()),
    name: Parameter.Body(Schema.String()),
    email: Parameter.Body(Schema.String()),
  },
  Schema.Object({
    success: Schema.Boolean(),
  }),
);

// {}
type QueryParameters = ResolveQueryParameters<typeof request.parameters>;

// { id: string }
type PathParameters = ResolvePathParameters<typeof request.parameters>;

// { name: string, email: string }
type RequestBody = ResolveRequestBody<typeof request.parameters>;

// { success: boolean }
type ResponseBody = Resolve<ObjectSchema<typeof request.response>>;
```

## OASBuilder
use ```OASBuilder``` to create OpenAPI Specification from [HTTP request schemas](#http).

```typescript
const Responses = {
  User: Schema.Object({
    id: Schema.String(),
    name: Schema.String(),
    gender: Schema.Nullable(Schema.Enum(["men", "women"])),
    email: Schema.Optional(Schema.String()),
  }),
};

const httpRequestSchemas = [
  HTTP.PATCH(
    "updateUser",
    "/user/{id}",
    {
      id: Parameter.Path(Schema.String()),
      name: Parameter.Body(Schema.String()),
    },
    Responses.User,
  ),
];

const oas = new OASBuilder({ title: "api-v1", version: "1.0.0" }, httpRequestSchemas, Responses).build();

console.log(JSON.stringify(oas));
```

the code above prints:

```json
{
  "info": {
    "title": "api-v1",
    "version": "1.0.0"
  },
  "openapi": "3.0.1",
  "paths": {
    "/user/{id}": {
      "patch": {
        "operationId": "updateUser",
        "parameters": [
          {
            "required": true,
            "name": "id",
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string"
                  }
                },
                "required": [
                  "name"
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/User"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "gender": {
            "type": "string",
            "enum": [
              "men",
              "women"
            ],
            "nullable": true
          },
          "email": {
            "type": "string"
          }
        },
        "required": [
          "id",
          "name",
          "gender"
        ]
      }
    }
  }
}
```
