import { NextResponse } from "next/server";
import { getEventConfig } from "@/lib/config";
import { generateSlotsForDate, getAvailableDatesInMonth } from "@/lib/slots";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const timeZone = searchParams.get("tz") || "UTC";
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));

  const config = await getEventConfig();

  if (date) {
    const slots = generateSlotsForDate(date, config, timeZone);
    return NextResponse.json({ slots });
  }

  if (year && month >= 1 && month <= 12) {
    const dates = getAvailableDatesInMonth(year, month - 1, config, timeZone);
    return NextResponse.json({ dates });
  }

  return NextResponse.json({ error: "Provide date or year+month" }, { status: 400 });
}
