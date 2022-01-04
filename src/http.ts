import { RequestParameter, PathParameter, ObjectSchema, ObjectProperties, Resolve, AllSchema } from ".";

export type Method = "get" | "post" | "put" | "patch" | "delete";
export type Parameters = { [key in string]: RequestParameter };
export type ResponseBody = ObjectSchema<ObjectProperties>;

export type ExtractParametersFromPath<T extends string> = T extends `${any}{${infer ParamName}}/${infer Suffix}`
  ? { [key in ParamName | keyof ExtractParametersFromPath<Suffix>]: PathParameter<AllSchema> }
  : T extends `${any}{${infer ParamName}}`
  ? { [key in ParamName]: PathParameter<AllSchema> }
  : {};

export type HTTPRequest<
  M extends Method,
  PA extends string,
  PR extends ExtractParametersFromPath<PA> & Parameters,
  R extends ResponseBody
> = {
  method: M;
  operationId: string;
  path: PA;
  parameters: PR;
  response: R;
};

type ResolveParameters<T extends Parameters> = Resolve<
  ObjectSchema<{
    [key in keyof T]: T[key]["schema"];
  }>
>;

export type ResolveQueryParameters<T extends Parameters> = ResolveParameters<
  Pick<
    T,
    {
      [key in keyof T]: T[key] extends { type: "query" } ? key : never;
    }[keyof T]
  >
>;

export type ResolvePathParameters<T extends Parameters> = ResolveParameters<
  Pick<
    T,
    {
      [key in keyof T]: T[key] extends { type: "path" } ? key : never;
    }[keyof T]
  >
>;

export type ResolveRequestBody<T extends Parameters> = ResolveParameters<
  Pick<
    T,
    {
      [key in keyof T]: T[key] extends { type: "body" } ? key : never;
    }[keyof T]
  >
>;

export class HTTP {
  public static GET<PA extends string, PR extends ExtractParametersFromPath<PA> & Parameters, R extends ResponseBody>(
    operationId: string,
    path: PA,
    parameters: PR,
    response: R
  ): HTTPRequest<"get", PA, PR, R> {
    return { method: "get", operationId, path, parameters, response };
  }

  public static POST<PA extends string, PR extends ExtractParametersFromPath<PA> & Parameters, R extends ResponseBody>(
    operationId: string,
    path: PA,
    parameters: PR,
    response: R
  ): HTTPRequest<"post", PA, PR, R> {
    return { method: "post", operationId, path, parameters, response };
  }

  public static PUT<PA extends string, PR extends ExtractParametersFromPath<PA> & Parameters, R extends ResponseBody>(
    operationId: string,
    path: PA,
    parameters: PR,
    response: R
  ): HTTPRequest<"put", PA, PR, R> {
    return { method: "put", operationId, path, parameters, response };
  }

  public static PATCH<PA extends string, PR extends ExtractParametersFromPath<PA> & Parameters, R extends ResponseBody>(
    operationId: string,
    path: PA,
    parameters: PR,
    response: R
  ): HTTPRequest<"patch", PA, PR, R> {
    return { method: "patch", operationId, path, parameters, response };
  }

  public static DELETE<
    PA extends string,
    PR extends ExtractParametersFromPath<PA> & Parameters,
    R extends ResponseBody
  >(operationId: string, path: PA, parameters: PR, response: R): HTTPRequest<"delete", PA, PR, R> {
    return { method: "delete", operationId, path, parameters, response };
  }
}
