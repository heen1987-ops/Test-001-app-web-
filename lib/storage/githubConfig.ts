// 브라우저(localStorage)에 저장되는 GitHub 연결 정보. 서버가 없으므로 로그인 대신
// 이 저장소 하나에만 쓸 수 있는 PAT를 기기마다 한 번씩 붙여넣어 사용한다.
export interface GithubConfig {
  owner: string;
  repo: string;
  token: string;
  branch?: string;
}

const STORAGE_KEY = "moveos:github-config";

export const DEFAULT_OWNER = "heen1987-ops";
export const DEFAULT_REPO = "Test-001-app-data-";

export function loadGithubConfig(): GithubConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GithubConfig>;
    if (!parsed.token || !parsed.owner || !parsed.repo) return null;
    return { owner: parsed.owner, repo: parsed.repo, token: parsed.token, branch: parsed.branch };
  } catch {
    return null;
  }
}

export function saveGithubConfig(config: GithubConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearGithubConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}
