import { NextResponse } from "next/server";
import { headers } from "next/headers";

const TZ_BY_COUNTRY: Record<string, string> = {
  US: "America/New_York",
  CA: "America/Toronto",
  GB: "Europe/London",
  DE: "Europe/Berlin",
  FR: "Europe/Paris",
  RU: "Europe/Moscow",
  UA: "Europe/Kyiv",
  PL: "Europe/Warsaw",
  NL: "Europe/Amsterdam",
  AU: "Australia/Sydney",
  JP: "Asia/Tokyo",
  IN: "Asia/Kolkata",
  BR: "America/Sao_Paulo",
  IL: "Asia/Jerusalem",
  AE: "Asia/Dubai",
  SG: "Asia/Singapore",
};

async function lookupByIp(ip: string): Promise<string | null> {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.")) {
    return null;
  }

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { timezone?: string };
    return data.timezone || null;
  } catch {
    return null;
  }
}

export async function GET() {
  const h = await headers();
  const vercelTz = h.get("x-vercel-ip-timezone");
  if (vercelTz) {
    return NextResponse.json({ timeZone: vercelTz, source: "vercel" });
  }

  const country =
    h.get("x-vercel-ip-country") ||
    h.get("cf-ipcountry") ||
    h.get("x-country-code");

  if (country && TZ_BY_COUNTRY[country.toUpperCase()]) {
    return NextResponse.json({
      timeZone: TZ_BY_COUNTRY[country.toUpperCase()],
      source: "country",
    });
  }

  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
  const fromIp = await lookupByIp(ip);
  if (fromIp) {
    return NextResponse.json({ timeZone: fromIp, source: "ip" });
  }

  return NextResponse.json({ timeZone: "Europe/Moscow", source: "default" });
}
