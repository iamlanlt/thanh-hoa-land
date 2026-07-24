import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";

type LogContext = Record<string, string | number | boolean | null | undefined>;

function sanitizeContext(context: LogContext) {
  return Object.fromEntries(
    Object.entries(context).filter(
      ([key, value]) =>
        value !== undefined &&
        !/(password|secret|token|authorization|cookie|phone|email)/i.test(key),
    ),
  );
}

export function logServerError(
  operation: string,
  error: unknown,
  context: LogContext = {},
) {
  const isProduction = process.env.NODE_ENV === "production";
  const code =
    error instanceof Prisma.PrismaClientKnownRequestError
      ? error.code
      : undefined;
  const detail =
    error instanceof Error
      ? {
          name: error.name,
          ...(code ? { code } : {}),
          ...(!isProduction ? { message: error.message } : {}),
        }
      : { name: "UnknownError", message: "Non-Error value thrown" };
  console.error("[server-error]", {
    operation,
    ...sanitizeContext(context),
    ...detail,
  });
}

export function apiErrorResponse(
  operation: string,
  error: unknown,
  fallbackMessage: string,
  context: LogContext = {},
) {
  logServerError(operation, error, context);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Dữ liệu đã tồn tại hoặc bị trùng." },
        { status: 409 },
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Không tìm thấy dữ liệu." },
        { status: 404 },
      );
    }
  }

  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    return NextResponse.json(
      { error: "Dịch vụ dữ liệu tạm thời không khả dụng." },
      { status: 503 },
    );
  }

  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
