import { NextResponse } from "next/server";
import { getEventConfig, saveEventConfig, eventConfigSchema } from "@/lib/config";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "admin_session";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === "1";
}

export async function GET() {
  const config = await getEventConfig();
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = eventConfigSchema.parse(body);
    const saved = await saveEventConfig(parsed);
    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid config" },
      { status: 400 },
    );
  }
}
