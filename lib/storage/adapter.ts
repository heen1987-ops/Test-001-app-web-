import type { ISODate, ISODateTime, ProjectData } from "../types";

export interface ProjectListItem {
  id: string;
  name: string;
  moveDate: ISODate | null;
  updatedAt: ISODateTime;
}

export type SaveResult =
  | { status: "ok"; sha: string }
  | { status: "conflict"; latest: ProjectData; latestSha: string };

/**
 * 저장 방식을 감추는 경계. 동시성 단위는 "프로젝트 파일 전체"이며(파일 하나 = 프로젝트 하나),
 * sha는 "마지막으로 읽은 버전"을 뜻하는 불투명한 토큰이다(로컬 어댑터는 가짜 버전 문자열,
 * GitHub 어댑터는 실제 파일 SHA). 나중에 DB로 바꾸더라도 이 인터페이스는 그대로 유지하고
 * sha 자리에 버전 컬럼 등을 넣으면 된다.
 */
export interface DataAdapter {
  listProjects(): Promise<ProjectListItem[]>;
  getProject(projectId: string): Promise<{ data: ProjectData; sha: string } | null>;
  createProject(data: ProjectData): Promise<{ sha: string }>;
  saveProject(projectId: string, data: ProjectData, expectedSha: string): Promise<SaveResult>;
  archiveProject(projectId: string): Promise<void>;
}

export class ConflictError extends Error {
  constructor(public latest: ProjectData, public latestSha: string) {
    super("save conflict: project was modified elsewhere since last read");
    this.name = "ConflictError";
  }
}
