# request-typer

make typed request schema and build OpenAPI Specification

## Features
- [Schema](#schema)
- [Validator](#validator)
- [HTTP](#http)

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
