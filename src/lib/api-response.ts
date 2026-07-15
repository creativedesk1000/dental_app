import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data } satisfies ApiSuccess<T>, {
    status,
  });
}

export function apiError(
  message: string,
  status = 400,
  errors?: Record<string, string[]>
) {
  return NextResponse.json(
    { success: false, message, errors } satisfies ApiError,
    { status }
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".") || "root";
      if (!errors[key]) errors[key] = [];
      errors[key].push(issue.message);
    }
    return apiError("Validation failed", 422, errors);
  }

  if (error instanceof ApiException) {
    return apiError(error.message, error.status);
  }

  console.error("Unhandled API error:", error);
  return apiError("Internal Server Error", 500);
}

export class ApiException extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message);
    this.name = "ApiException";
  }
}
