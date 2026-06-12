import { NextResponse } from "next/server";
import { HttpError } from "@/lib/http-error";

export function handleApiError(error) {
  if (error instanceof HttpError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details
      },
      { status: error.status }
    );
  }

  if (error?.name === "ValidationError") {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: Object.values(error.errors).map((item) => item.message)
      },
      { status: 400 }
    );
  }

  if (error?.name === "CastError") {
    return NextResponse.json(
      {
        error: "Invalid identifier"
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      error: "Internal server error"
    },
    { status: 500 }
  );
}
