import { NextResponse } from "next/server";
import { requireAuthorizedUser, UnauthorizedError } from "@/lib/auth/requireUser";
import { getServerAdapter } from "@/lib/storage/serverAdapter";
import type { ProjectData } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireAuthorizedUser();
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    throw e;
  }
  const { id } = await params;
  const adapter = getServerAdapter();
  const result = await adapter.getProject(id);
  if (!result) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(result);
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await requireAuthorizedUser();
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    throw e;
  }
  const { id } = await params;
  const body = (await request.json()) as { data: ProjectData; expectedSha: string };
  const adapter = getServerAdapter();
  const result = await adapter.saveProject(id, body.data, body.expectedSha);
  return NextResponse.json(result);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    await requireAuthorizedUser();
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    throw e;
  }
  const { id } = await params;
  const adapter = getServerAdapter();
  await adapter.archiveProject(id);
  return NextResponse.json({ ok: true });
}
