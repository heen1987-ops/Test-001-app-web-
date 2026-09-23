import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyProjectData, createProject } from "../factories";
import type { ProjectData } from "../types";
import { GithubAdapter } from "./githubAdapter";

function encode(data: ProjectData): string {
  return Buffer.from(JSON.stringify(data), "utf-8").toString("base64");
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("GithubAdapter", () => {
  const config = { owner: "heen1987-ops", repo: "Test-001-app-data-", token: "fake-pat" };
  let sampleData: ProjectData;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sampleData = createEmptyProjectData(createProject({ name: "샘플 프로젝트" }));
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getProject: 200 응답을 디코드해서 반환한다", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { content: encode(sampleData), sha: "sha-1" }));
    const adapter = new GithubAdapter(config);
    const result = await adapter.getProject(sampleData.project.id);
    expect(result?.sha).toBe("sha-1");
    expect(result?.data.project.name).toBe("샘플 프로젝트");
  });

  it("getProject: 404면 null을 반환한다(에러를 던지지 않는다)", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(404, { message: "Not Found" }));
    const adapter = new GithubAdapter(config);
    expect(await adapter.getProject("no-such-id")).toBeNull();
  });

  it("createProject: PUT 요청 후 새 sha를 반환한다", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(201, { content: { sha: "sha-created" } }));
    const adapter = new GithubAdapter(config);
    const result = await adapter.createProject(sampleData);
    expect(result.sha).toBe("sha-created");
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("PUT");
  });

  it("saveProject: sha가 최신이면 그대로 저장하고 새 sha를 반환한다", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { content: { sha: "sha-2" } }));
    const adapter = new GithubAdapter(config);
    const result = await adapter.saveProject(sampleData.project.id, sampleData, "sha-1");
    expect(result).toEqual({ status: "ok", sha: "sha-2" });
  });

  it("saveProject: 409(sha 불일치)면 최신 데이터를 다시 조회해 conflict로 반환하고 덮어쓰지 않는다", async () => {
    const latest = { ...sampleData, project: { ...sampleData.project, name: "다른 기기에서 바꾼 이름" } };
    fetchMock
      .mockResolvedValueOnce(jsonResponse(409, { message: "sha does not match" }))
      .mockResolvedValueOnce(jsonResponse(200, { content: encode(latest), sha: "sha-latest" }));

    const adapter = new GithubAdapter(config);
    const result = await adapter.saveProject(sampleData.project.id, sampleData, "sha-stale");

    expect(result.status).toBe("conflict");
    if (result.status === "conflict") {
      expect(result.latestSha).toBe("sha-latest");
      expect(result.latest.project.name).toBe("다른 기기에서 바꾼 이름");
    }
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("listProjects: 디렉터리 목록을 조회해 각 파일을 읽고 보관되지 않은 것만 반환한다", async () => {
    const active = createEmptyProjectData(createProject({ name: "진행중" }));
    const archived = createEmptyProjectData(createProject({ name: "보관됨" }));
    archived.project.archived = true;

    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(200, [
          { name: `${active.project.id}.json`, type: "file" },
          { name: `${archived.project.id}.json`, type: "file" },
        ]),
      )
      .mockResolvedValueOnce(jsonResponse(200, { content: encode(active), sha: "sha-a" }))
      .mockResolvedValueOnce(jsonResponse(200, { content: encode(archived), sha: "sha-b" }));

    const adapter = new GithubAdapter(config);
    const list = await adapter.listProjects();
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("진행중");
  });

  it("listProjects: 디렉터리가 없으면(404) 빈 배열", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(404, { message: "Not Found" }));
    const adapter = new GithubAdapter(config);
    expect(await adapter.listProjects()).toEqual([]);
  });
});
