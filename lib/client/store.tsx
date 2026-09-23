"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createEmptyProjectData, createProject as createProjectRecord } from "../factories";
import type { DataAdapter, ProjectListItem } from "../storage/adapter";
import type { ProjectData } from "../types";

export type SaveStatus = "loading" | "saving" | "saved" | "error" | "conflict";

const SELECTED_PROJECT_KEY = "moveos:selected-project-id";

interface AppDataValue {
  /** null이면 아직 목록을 불러오는 중 */
  projects: ProjectListItem[] | null;
  selectedId: string | null;
  data: ProjectData | null;
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  conflictLatest: ProjectData | null;
  /** 초기 목록·데이터 불러오기 자체가 실패했을 때(네트워크, 세션 만료 등) */
  loadError: string | null;
  selectProject: (id: string) => void;
  createProject: (input: Parameters<typeof createProjectRecord>[0]) => Promise<string>;
  mutate: (fn: (data: ProjectData) => ProjectData) => void;
  reloadFromConflict: () => void;
  archiveCurrentProject: () => Promise<void>;
}

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ adapter, children }: { adapter: DataAdapter; children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectListItem[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [data, setData] = useState<ProjectData | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("loading");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [conflictLatest, setConflictLatest] = useState<ProjectData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const shaRef = useRef<string | null>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const dataRef = useRef<ProjectData | null>(null);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // 프로젝트 목록 최초 로드 + 마지막으로 선택했던 프로젝트 복원
  useEffect(() => {
    let cancelled = false;
    adapter
      .listProjects()
      .then((list) => {
        if (cancelled) return;
        setProjects(list);
        const stored = localStorage.getItem(SELECTED_PROJECT_KEY);
        const initial = stored && list.some((p) => p.id === stored) ? stored : (list[0]?.id ?? null);
        if (initial) setSaveStatus("loading");
        setSelectedId(initial);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "목록을 불러오지 못했습니다.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 선택된 프로젝트가 바뀌면 해당 프로젝트 데이터를 로드
  useEffect(() => {
    if (!selectedId) {
      shaRef.current = null;
      return;
    }
    let cancelled = false;
    adapter
      .getProject(selectedId)
      .then((res) => {
        if (cancelled || !res) return;
        setData(res.data);
        shaRef.current = res.sha;
        setSaveStatus("saved");
        setLastSavedAt(res.data.project.updatedAt);
        setConflictLatest(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "프로젝트를 불러오지 못했습니다.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const selectProject = useCallback((id: string) => {
    localStorage.setItem(SELECTED_PROJECT_KEY, id);
    setSaveStatus("loading");
    setSelectedId(id);
  }, []);

  const createProject = useCallback<AppDataValue["createProject"]>(
    async (input) => {
      const project = createProjectRecord(input);
      const initial = createEmptyProjectData(project);
      const { sha } = await adapter.createProject(initial);
      setProjects((prev) => [
        { id: project.id, name: project.name, moveDate: project.moveDate, updatedAt: project.updatedAt },
        ...(prev ?? []),
      ]);
      shaRef.current = sha;
      setData(initial);
      setSaveStatus("saved");
      setLastSavedAt(project.updatedAt);
      localStorage.setItem(SELECTED_PROJECT_KEY, project.id);
      setSelectedId(project.id);
      return project.id;
    },
    [adapter],
  );

  const persist = useCallback(
    (projectId: string, next: ProjectData) => {
      queueRef.current = queueRef.current
        .then(async () => {
          if (shaRef.current == null) return;
          setSaveStatus("saving");
          const result = await adapter.saveProject(projectId, next, shaRef.current);
          if (result.status === "ok") {
            shaRef.current = result.sha;
            setSaveStatus("saved");
            setLastSavedAt(next.project.updatedAt);
          } else {
            setConflictLatest(result.latest);
            setSaveStatus("conflict");
          }
        })
        .catch(() => setSaveStatus("error"));
    },
    [adapter],
  );

  // setState 업데이터 안에서 persist(네트워크/스토리지 부작용)를 직접 호출하지 않는다 — React가
  // 개발 모드에서 업데이터 함수를 두 번 호출할 수 있어(순수성 검증), 그 안에 부작용을 두면 저장이
  // 중복 실행된다. 대신 dataRef로 최신 값을 동기적으로 읽어 next를 한 번만 계산하고,
  // setData와 persist를 이 콜백 안에서 각각 정확히 한 번씩만 호출한다.
  const mutate = useCallback(
    (fn: (data: ProjectData) => ProjectData) => {
      const projectId = selectedId;
      const prev = dataRef.current;
      if (!projectId || !prev) return;
      const mutated = fn(prev);
      const next: ProjectData = {
        ...mutated,
        project: { ...mutated.project, updatedAt: new Date().toISOString() },
      };
      dataRef.current = next;
      setData(next);
      persist(projectId, next);
    },
    [selectedId, persist],
  );

  const reloadFromConflict = useCallback(() => {
    if (!selectedId) return;
    adapter.getProject(selectedId).then((res) => {
      if (!res) return;
      setData(res.data);
      shaRef.current = res.sha;
      setConflictLatest(null);
      setSaveStatus("saved");
      setLastSavedAt(res.data.project.updatedAt);
    });
  }, [adapter, selectedId]);

  const archiveCurrentProject = useCallback(async () => {
    if (!selectedId) return;
    await adapter.archiveProject(selectedId);
    const list = await adapter.listProjects();
    setProjects(list);
    const nextId = list[0]?.id ?? null;
    if (nextId) selectProject(nextId);
    else {
      localStorage.removeItem(SELECTED_PROJECT_KEY);
      setSelectedId(null);
    }
  }, [adapter, selectedId, selectProject]);

  // selectedId가 없으면(프로젝트 목록이 비었거나 막 보관 처리된 직후) data는 항상 null로 노출한다 —
  // 이전 프로젝트의 데이터가 잠깐이라도 남아 보이지 않게 한다.
  const exposedData = selectedId ? data : null;

  const value = useMemo<AppDataValue>(
    () => ({
      projects,
      selectedId,
      data: exposedData,
      saveStatus,
      lastSavedAt,
      conflictLatest,
      loadError,
      selectProject,
      createProject,
      mutate,
      reloadFromConflict,
      archiveCurrentProject,
    }),
    [
      projects,
      selectedId,
      exposedData,
      saveStatus,
      lastSavedAt,
      conflictLatest,
      loadError,
      selectProject,
      createProject,
      mutate,
      reloadFromConflict,
      archiveCurrentProject,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
