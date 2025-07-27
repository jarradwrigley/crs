import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const debouncedSearchQuery = searchParams.get("q");

    if (!debouncedSearchQuery || typeof debouncedSearchQuery !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid query parameter `q`" },
        { status: 400 }
      );
    }

    const apiResponse = await fetch(
      `${process.env.API_BASE_URL}/devices/search?q=${encodeURIComponent(
        debouncedSearchQuery
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const searchResult = await apiResponse.json();

    if (!apiResponse.ok || !searchResult.success) {
      return NextResponse.json(
        {
          error: searchResult?.message?.toString() || "Device search failed",
        },
        { status: apiResponse.status || 500 }
      );
    }

    return NextResponse.json(searchResult);
  } catch (error: any) {
    console.error("Device search error:", error);
    return NextResponse.json(
      { error: "Internal server error during device search" },
      { status: 500 }
    );
  }
}
