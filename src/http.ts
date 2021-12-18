import { ObjectSchema, Parameter, Schema } from ".";
import { RequestParameter } from "./parameter";
import { AllSchema, Resolve } from "./schema";

export type Method = "get" | "post" | "put" | "patch" | "delete";
export type Parameters = { [key in string]: RequestParameter };
export type ResponseBody = { [key in string]: AllSchema };

export type HTTPRequest<M extends Method, P extends Parameters, R extends ResponseBody> = {
  method: M;
  operationId: string;
  path: string;
  parameters: P;
  response: R;
};

type ResolveParameters<T extends Parameters> = {
  [key in keyof T]: Resolve<T[key]["schema"]>;
};

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
  public static GET<P extends Parameters, R extends ResponseBody>(
    operationId: string,
    path: string,
    parameters: P,
    response: R
  ): HTTPRequest<"get", P, R> {
    return { method: "get", operationId, path, parameters, response };
  }

  public static POST<P extends Parameters, R extends ResponseBody>(
    operationId: string,
    path: string,
    parameters: P,
    response: R
  ): HTTPRequest<"post", P, R> {
    return { method: "post", operationId, path, parameters, response };
  }

  public static PUT<P extends Parameters, R extends ResponseBody>(
    operationId: string,
    path: string,
    parameters: P,
    response: R
  ): HTTPRequest<"put", P, R> {
    return { method: "put", operationId, path, parameters, response };
  }

  public static PATCH<P extends Parameters, R extends ResponseBody>(
    operationId: string,
    path: string,
    parameters: P,
    response: R
  ): HTTPRequest<"patch", P, R> {
    return { method: "patch", operationId, path, parameters, response };
  }

  public static DELETE<P extends Parameters, R extends ResponseBody>(
    operationId: string,
    path: string,
    parameters: P,
    response: R
  ): HTTPRequest<"delete", P, R> {
    return { method: "delete", operationId, path, parameters, response };
  }
}
