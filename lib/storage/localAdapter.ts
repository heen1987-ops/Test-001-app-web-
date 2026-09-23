import type { ProjectData } from "../types";
import type { DataAdapter, ProjectListItem, SaveResult } from "./adapter";

const PROJECT_KEY_PREFIX = "moveos:project:";
const INDEX_KEY = "moveos:project-index";

interface StoredProject {
  data: ProjectData;
  sha: string;
}

function readIndex(): string[] {
  const raw = localStorage.getItem(INDEX_KEY);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

function writeIndex(ids: string[]): void {
  localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
}

function readStored(projectId: string): StoredProject | null {
  const raw = localStorage.getItem(PROJECT_KEY_PREFIX + projectId);
  return raw ? (JSON.parse(raw) as StoredProject) : null;
}

function writeStored(projectId: string, stored: StoredProject): void {
  localStorage.setItem(PROJECT_KEY_PREFIX + projectId, JSON.stringify(stored));
  const ids = readIndex();
  if (!ids.includes(projectId)) writeIndex([...ids, projectId]);
}

function nextSha(prevSha: string | undefined): string {
  return String(prevSha ? parseInt(prevSha, 10) + 1 : 1);
}

/**
 * 브라우저(localStorage)에 저장하는 어댑터 — 로그인이나 서버 없이 이 기기에서만 데이터를 보관한다.
 * sha는 저장할 때마다 증가하는 문자열이며, "마지막으로 읽은 버전과 다르면 충돌"로 처리한다 —
 * 브라우저 탭 두 개로 같은 프로젝트를 열어두면 충돌 처리 경로를 실제로 재현해 볼 수 있다.
 */
export class LocalAdapter implements DataAdapter {
  constructor(private readonly latencyMs = 200) {}

  private async delay(): Promise<void> {
    if (this.latencyMs > 0) await new Promise((r) => setTimeout(r, this.latencyMs));
  }

  async listProjects(): Promise<ProjectListItem[]> {
    await this.delay();
    return readIndex()
      .map((id) => readStored(id))
      .filter((s): s is StoredProject => s !== null && !s.data.project.archived)
      .map((s) => ({
        id: s.data.project.id,
        name: s.data.project.name,
        moveDate: s.data.project.moveDate,
        updatedAt: s.data.project.updatedAt,
      }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getProject(projectId: string): Promise<{ data: ProjectData; sha: string } | null> {
    await this.delay();
    const stored = readStored(projectId);
    return stored ? { data: stored.data, sha: stored.sha } : null;
  }

  async createProject(data: ProjectData): Promise<{ sha: string }> {
    await this.delay();
    const sha = nextSha(undefined);
    writeStored(data.project.id, { data, sha });
    return { sha };
  }

  async saveProject(projectId: string, data: ProjectData, expectedSha: string): Promise<SaveResult> {
    await this.delay();
    const current = readStored(projectId);
    if (!current) {
      const sha = nextSha(undefined);
      writeStored(projectId, { data, sha });
      return { status: "ok", sha };
    }
    if (current.sha !== expectedSha) {
      return { status: "conflict", latest: current.data, latestSha: current.sha };
    }
    const sha = nextSha(current.sha);
    writeStored(projectId, { data, sha });
    return { status: "ok", sha };
  }

  async archiveProject(projectId: string): Promise<void> {
    await this.delay();
    const current = readStored(projectId);
    if (!current) return;
    const archived: ProjectData = { ...current.data, project: { ...current.data.project, archived: true } };
    writeStored(projectId, { data: archived, sha: nextSha(current.sha) });
  }
}
