import { NextResponse } from "next/server";
import { requireAuthorizedUser, UnauthorizedError } from "@/lib/auth/requireUser";
import { getServerAdapter } from "@/lib/storage/serverAdapter";
import type { ProjectData } from "@/lib/types";

export async function GET() {
  try {
    await requireAuthorizedUser();
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    throw e;
  }
  const adapter = getServerAdapter();
  const projects = await adapter.listProjects();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  try {
    await requireAuthorizedUser();
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    throw e;
  }
  const data = (await request.json()) as ProjectData;
  const adapter = getServerAdapter();
  const result = await adapter.createProject(data);
  return NextResponse.json(result);
}
