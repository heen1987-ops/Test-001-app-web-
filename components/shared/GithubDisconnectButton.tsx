"use client";
import { clearGithubConfig } from "@/lib/storage/githubConfig";

export function GithubDisconnectButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm("연결을 해제할까요? 이 브라우저에 저장된 토큰만 지워지고, GitHub의 데이터는 그대로 남습니다.")) {
          clearGithubConfig();
          window.location.reload();
        }
      }}
      className="text-xs font-semibold text-subtle hover:text-negative"
    >
      연결 해제
    </button>
  );
}
