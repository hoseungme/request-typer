# request-typer
[![npm version](https://badge.fury.io/js/request-typer.svg)](https://badge.fury.io/js/request-typer)
[![npm download](https://badgen.net/npm/dt/request-typer)](https://badgen.net/npm/dt/request-typer)

Make typed request schema and build OpenAPI Specification.

No dependencies. Only pure Javascript.

## Features
- [Schema](#schema)
- [Validator](#validator)
- [HTTP](#http)
- [OASBuilder](#oasbuilder)

## Schema
use ```Schema``` to create type definition.

```typescript
/*
{
  id: string;
  name: string;
  email?: string;
  createdAt: number;
}
*/
const user = Schema.Object({
  id: Schema.String(),
  name: Schema.String(),
  email: Schema.Optional(Schema.String()),
  createdAt: Schema.Number(),
});
```

## Validator
use ```Validator``` to compare [Schema](#schema) with value.

```typescript
Validator.validate(Schema.Number(), 1234); // true
Validator.validate(Schema.Array(Schema.String()), [1, 2, 3, 4]); // false
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
  {
    user: Schema.Object({ id: Schema.String() }),
  }
);
```

## OASBuilder
use ```OASBuilder``` to create OpenAPI Specification from [HTTP request schemas](#http).

```typescript
const Responses = {
  User: {
    id: Schema.String(),
    name: Schema.String(),
    gender: Schema.Nullable(Schema.Enum(["men", "women"])),
    email: Schema.Optional(Schema.String()),
  },
};

const httpRequestSchemas = [
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
