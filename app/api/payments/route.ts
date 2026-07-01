import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    data: [
      { id: "PAY-1", bookingId: "BK-1001", amount: 400, status: "paid" },
      { id: "PAY-2", bookingId: "BK-1002", amount: 600, status: "pending" },
    ],
  });
}
