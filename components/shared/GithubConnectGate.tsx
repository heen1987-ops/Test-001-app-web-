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
      if (res.status === 401 || res.status === 403) {
        throw new Error("토큰이 올바르지 않거나, 이 저장소에 대한 Contents 읽기/쓰기 권한이 없습니다.");
      }
      if (res.status === 404) {
        throw new Error("저장소를 찾을 수 없습니다. 소유자·저장소 이름을 확인해주세요.");
      }
      if (!res.ok) {
        throw new Error(`연결 확인에 실패했습니다 (${res.status})`);
      }
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-card-md sm:p-8">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
              M
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">MOVE OS 연결</h1>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            순수 GitHub로 동작하는 이사 관리 앱입니다. 데이터 저장소(
            <code className="rounded bg-surface-2 px-1 py-0.5 text-xs font-bold text-foreground">
              {owner}/{repo}
            </code>
            )에 접근할 수 있는 GitHub Token(PAT)을 입력해주세요.
          </p>
        </div>

        {/* 토큰 발급 가이드 카드 */}
        <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface-2 p-4 text-xs leading-relaxed text-muted">
          <div className="flex items-center justify-between font-bold text-foreground">
            <span>🔑 GitHub 토큰 발급 가이드</span>
            <a
              href="https://github.com/settings/tokens?type=beta"
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent transition hover:bg-accent/20"
            >
              토큰 생성 페이지 열기 ↗
            </a>
          </div>
          <ol className="flex list-decimal flex-col gap-1 pl-4">
            <li>
              <strong>Repository access</strong>: <em>Only select repositories</em> 선택 후{" "}
              <strong className="text-accent">{repo}</strong> 지정
            </li>
            <li>
              <strong>Permissions</strong>: <em>Repository permissions</em> → <em>Contents</em> 권한을{" "}
              <strong className="text-accent">Read and write</strong>로 설정
            </li>
            <li>하단 <strong>Generate token</strong> 클릭 후 발급된 토큰 복사</li>
          </ol>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold text-foreground">GitHub Personal Access Token (PAT)</span>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConnect();
            }}
            placeholder="github_pat_..."
            className={fieldClass}
            autoFocus
          />
        </label>

        {!showAdvanced ? (
          <button
            type="button"
            onClick={() => setShowAdvanced(true)}
            className="w-fit text-xs font-medium text-subtle hover:text-foreground"
          >
            ⚙️ 저장소 설정 변경 (기본값: {owner}/{repo})
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface-2 p-3">
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold text-muted">소유자</span>
              <input value={owner} onChange={(e) => setOwner(e.target.value)} className={fieldClass} />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold text-muted">저장소</span>
              <input value={repo} onChange={(e) => setRepo(e.target.value)} className={fieldClass} />
            </label>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-negative-light/30 p-3 text-xs font-medium text-negative-ink border border-negative-ink/20">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleConnect}
          disabled={checking}
          className="rounded-xl bg-accent py-2.5 text-sm font-bold text-white shadow-card transition-all hover:bg-accent-ink disabled:opacity-60"
        >
          {checking ? "연결 확인 중…" : "연결하고 시작하기"}
        </button>

        <p className="text-center text-[11px] text-subtle">
          🔒 토큰은 현재 기기 브라우저에만 저장되며, 어떠한 외부 서버로도 전송되지 않습니다.
        </p>
      </div>
    </div>
  );
}

