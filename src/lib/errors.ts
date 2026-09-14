import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "ERROR",
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const badRequest = (msg = "Invalid request", details?: unknown) =>
  new ApiError(400, msg, "BAD_REQUEST", details);
export const unauthorized = (msg = "Please sign in to continue") =>
  new ApiError(401, msg, "UNAUTHORIZED");
export const forbidden = (msg = "You do not have access to this action") =>
  new ApiError(403, msg, "FORBIDDEN");
export const notFound = (msg = "Not found") => new ApiError(404, msg, "NOT_FOUND");
export const tooMany = (msg = "Too many requests. Please try again later.") =>
  new ApiError(429, msg, "RATE_LIMITED");

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

export function publicErrorMessage(e: unknown): string {
  if (isApiError(e)) return e.message;
  if (e instanceof ZodError) return "Please check the information you entered and try again.";
  if (
    e instanceof Prisma.PrismaClientKnownRequestError ||
    e instanceof Prisma.PrismaClientValidationError
  ) {
    return "We could not process this request. Please call us directly.";
  }
  return "Something went wrong. Please call us directly.";
}
