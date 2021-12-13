import { RequestParameter } from "./parameter";
import { AllType } from "./schema";

type Method = "get" | "post" | "put" | "patch" | "delete";
type Parameters = { [key in string]: RequestParameter };
type ResponseBody = { [key in string]: AllType };

type Request<M extends Method, P extends Parameters, R extends ResponseBody> = {
  method: M;
  operationId: string;
  path: string;
  parameters: P;
  response: R;
};

export class HTTP {
  public static GET<P extends Parameters, R extends ResponseBody>(
    operationId: string,
    path: string,
    parameters: P,
    response: R
  ): Request<"get", P, R> {
    return { method: "get", operationId, path, parameters, response };
  }

  public static POST<P extends Parameters, R extends ResponseBody>(
    operationId: string,
    path: string,
    parameters: P,
    response: R
  ): Request<"post", P, R> {
    return { method: "post", operationId, path, parameters, response };
  }

  public static PUT<P extends Parameters, R extends ResponseBody>(
    operationId: string,
    path: string,
    parameters: P,
    response: R
  ): Request<"put", P, R> {
    return { method: "put", operationId, path, parameters, response };
  }

  public static PATCH<P extends Parameters, R extends ResponseBody>(
    operationId: string,
    path: string,
    parameters: P,
    response: R
  ): Request<"patch", P, R> {
    return { method: "patch", operationId, path, parameters, response };
  }

  public static DELETE<P extends Parameters, R extends ResponseBody>(
    operationId: string,
    path: string,
    parameters: P,
    response: R
  ): Request<"delete", P, R> {
    return { method: "delete", operationId, path, parameters, response };
  }
}
