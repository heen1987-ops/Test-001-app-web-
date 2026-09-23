import type { ProjectData } from "../types";
import type { DataAdapter, ProjectListItem, SaveResult } from "./adapter";

export interface GithubAdapterConfig {
  owner: string;
  repo: string;
  /** Contents 읽기/쓰기 권한만 가진 fine-grained PAT. 로그인용 OAuth 토큰과는 다른 자격증명이어야 한다. */
  token: string;
  branch?: string;
}

const API_BASE = "https://api.github.com";
const PROJECTS_DIR = "data/projects";

function projectPath(id: string): string {
  return `${PROJECTS_DIR}/${id}.json`;
}

function encodeContent(data: ProjectData): string {
  return Buffer.from(JSON.stringify(data, null, 2), "utf-8").toString("base64");
}

function decodeContent(base64: string): ProjectData {
  return JSON.parse(Buffer.from(base64, "base64").toString("utf-8")) as ProjectData;
}

interface GithubContentsGetResponse {
  content: string;
  sha: string;
}
interface GithubContentsPutResponse {
  content: { sha: string };
}
interface GithubDirEntry {
  name: string;
  type: "file" | "dir";
}

/**
 * 서버(Netlify Functions/Route Handler)에서만 사용한다. 쓰기 토큰을 다루므로 이 파일을
 * "use client" 컴포넌트나 클라이언트 번들에 import하면 안 된다.
 */
export class GithubAdapter implements DataAdapter {
  constructor(private readonly config: GithubAdapterConfig) {}

  private headers(): HeadersInit {
    return {
      Authorization: `Bearer ${this.config.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
  }

  private url(path: string): string {
    const branchQuery = this.config.branch ? `?ref=${encodeURIComponent(this.config.branch)}` : "";
    return `${API_BASE}/repos/${this.config.owner}/${this.config.repo}/contents/${path}${branchQuery}`;
  }

  async listProjects(): Promise<ProjectListItem[]> {
    const res = await fetch(this.url(PROJECTS_DIR), { headers: this.headers() });
    if (res.status === 404) return [];
    if (!res.ok) throw new Error(`GitHub 목록 조회 실패 (${res.status})`);

    const entries = (await res.json()) as GithubDirEntry[];
    const files = entries.filter((e) => e.type === "file" && e.name.endsWith(".json"));

    const projects = await Promise.all(
      files.map(async (f) => this.getProject(f.name.replace(/\.json$/, ""))),
    );

    return projects
      .filter((p): p is { data: ProjectData; sha: string } => p !== null)
      .filter((p) => !p.data.project.archived)
      .map((p) => ({
        id: p.data.project.id,
        name: p.data.project.name,
        moveDate: p.data.project.moveDate,
        updatedAt: p.data.project.updatedAt,
      }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getProject(projectId: string): Promise<{ data: ProjectData; sha: string } | null> {
    const res = await fetch(this.url(projectPath(projectId)), { headers: this.headers() });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub 조회 실패 (${res.status})`);
    const body = (await res.json()) as GithubContentsGetResponse;
    return { data: decodeContent(body.content), sha: body.sha };
  }

  async createProject(data: ProjectData): Promise<{ sha: string }> {
    const res = await fetch(this.url(projectPath(data.project.id)), {
      method: "PUT",
      headers: { ...this.headers(), "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `create project ${data.project.id}`,
        content: encodeContent(data),
        branch: this.config.branch,
      }),
    });
    if (!res.ok) throw new Error(`GitHub 생성 실패 (${res.status})`);
    const body = (await res.json()) as GithubContentsPutResponse;
    return { sha: body.content.sha };
  }

  async saveProject(projectId: string, data: ProjectData, expectedSha: string): Promise<SaveResult> {
    const res = await fetch(this.url(projectPath(projectId)), {
      method: "PUT",
      headers: { ...this.headers(), "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `update project ${projectId}`,
        content: encodeContent(data),
        sha: expectedSha,
        branch: this.config.branch,
      }),
    });

    if (res.status === 409 || res.status === 422) {
      // sha가 최신이 아님 — 최신 데이터를 다시 읽어 "충돌"로 반환 (여기서 덮어쓰지 않는다)
      const latest = await this.getProject(projectId);
      if (latest) return { status: "conflict", latest: latest.data, latestSha: latest.sha };
      throw new Error(`저장 충돌 처리 중 최신 데이터를 찾지 못함 (${res.status})`);
    }
    if (!res.ok) throw new Error(`GitHub 저장 실패 (${res.status})`);
    const body = (await res.json()) as GithubContentsPutResponse;
    return { status: "ok", sha: body.content.sha };
  }

  async archiveProject(projectId: string): Promise<void> {
    const current = await this.getProject(projectId);
    if (!current) return;
    const archived: ProjectData = {
      ...current.data,
      project: { ...current.data.project, archived: true },
    };
    const result = await this.saveProject(projectId, archived, current.sha);
    if (result.status === "conflict") {
      throw new Error("보관 처리 중 다른 기기에서 먼저 저장했습니다. 최신 내용을 다시 불러온 뒤 시도하세요.");
    }
  }
}
