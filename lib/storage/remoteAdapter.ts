"use client";
import type { ProjectData } from "../types";
import type { DataAdapter, ProjectListItem, SaveResult } from "./adapter";

/**
 * 브라우저에서 쓰는 어댑터. GitHub 토큰을 직접 다루지 않고, 우리 서버 API(/api/projects/*)를
 * 호출한다 — 실제 GitHub Contents API 호출과 PAT는 그 API 라우트(서버) 안에서만 이뤄진다.
 */
export class RemoteAdapter implements DataAdapter {
  private async parse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      throw new Error(`요청 실패 (${res.status})`);
    }
    return res.json() as Promise<T>;
  }

  async listProjects(): Promise<ProjectListItem[]> {
    const res = await fetch("/api/projects");
    return this.parse<ProjectListItem[]>(res);
  }

  async getProject(projectId: string): Promise<{ data: ProjectData; sha: string } | null> {
    const res = await fetch(`/api/projects/${projectId}`);
    if (res.status === 404) return null;
    return this.parse(res);
  }

  async createProject(data: ProjectData): Promise<{ sha: string }> {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return this.parse(res);
  }

  async saveProject(projectId: string, data: ProjectData, expectedSha: string): Promise<SaveResult> {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, expectedSha }),
    });
    return this.parse<SaveResult>(res);
  }

  async archiveProject(projectId: string): Promise<void> {
    const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`보관 실패 (${res.status})`);
  }
}
