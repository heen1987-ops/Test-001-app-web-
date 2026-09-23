"use client";
import { useState } from "react";
import { DEFAULT_OWNER, DEFAULT_REPO, saveGithubConfig } from "@/lib/storage/githubConfig";

export function GithubConnectGate({ onConnected }: { onConnected: () => void }) {
  const [token, setToken] = useState("");
  const [owner, setOwner] = useState(DEFAULT_OWNER);
  const [repo, setRepo] = useState(DEFAULT_REPO);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleConnect = async () => {
    const trimmed = token.trim();
    if (!trimmed) {
      setError("토큰을 입력해주세요.");
      return;
    }
    setChecking(true);
    setError(null);
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Authorization: `Bearer ${trimmed}`, Accept: "application/vnd.github+json" },
      });
      if (res.status === 401 || res.status === 403) throw new Error("토큰이 올바르지 않거나, 이 저장소에 대한 권한이 없습니다.");
      if (res.status === 404) throw new Error("저장소를 찾을 수 없습니다. 소유자·저장소 이름을 확인해주세요.");
      if (!res.ok) throw new Error(`연결 확인에 실패했습니다 (${res.status})`);
      saveGithubConfig({ owner, repo, token: trimmed });
      onConnected();
    } catch (e) {
      setError(e instanceof Error ? e.message : "연결에 실패했습니다.");
    } finally {
      setChecking(false);
    }
  };

  const fieldClass =
    "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15";

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-card-md">
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-foreground">GitHub 연결</h1>
          <p className="mt-1 text-sm text-muted">
            데이터는 GitHub 저장소에 저장됩니다. 이 저장소 하나에만 쓸 수 있는 fine-grained 토큰(PAT)을
            붙여넣으면 이 기기에서도 같은 데이터를 볼 수 있어요.
          </p>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-muted">Personal Access Token</span>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="github_pat_..."
            className={fieldClass}
            autoFocus
          />
        </label>

        {!showAdvanced ? (
          <button
            type="button"
            onClick={() => setShowAdvanced(true)}
            className="w-fit text-xs font-semibold text-muted hover:text-foreground"
          >
            저장소 직접 지정 (선택)
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold text-muted">소유자</span>
              <input value={owner} onChange={(e) => setOwner(e.target.value)} className={fieldClass} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold text-muted">저장소</span>
              <input value={repo} onChange={(e) => setRepo(e.target.value)} className={fieldClass} />
            </label>
          </div>
        )}

        {error && <p className="text-sm text-negative-ink">{error}</p>}

        <button
          type="button"
          onClick={handleConnect}
          disabled={checking}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white shadow-card hover:bg-accent-ink disabled:opacity-60"
        >
          {checking ? "확인 중…" : "연결하기"}
        </button>

        <p className="text-xs leading-relaxed text-subtle">
          GitHub → Settings → Developer settings → Fine-grained tokens에서, 이 저장소({owner}/{repo})만
          선택하고 Contents 읽기/쓰기 권한만 준 토큰을 만들어 붙여넣으세요. 토큰은 이 브라우저에만
          저장되고 서버로 전송되지 않습니다.
        </p>
      </div>
    </div>
  );
}
