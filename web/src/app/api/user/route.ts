import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }
    // Replace with your actual API call
    const response = await fetch(`${process.env.API_BASE_URL}/auth/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const userResult = await response.json();

    // console.log("USER API response", userResult);

    if (!userResult.success) {
      throw new Error(
        userResult?.message.toString() || "Fetching User Profile Failed"
      );
    }

    return NextResponse.json(userResult);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Fetching User Profile Failed" },
      { status: 401 }
    );
  }
}
