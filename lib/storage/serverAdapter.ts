import { GithubAdapter } from "./githubAdapter";

/** 서버(Route Handler)에서만 호출한다. 데이터 저장소 접근에 필요한 세 값이 모두 있어야 동작한다. */
export function getServerAdapter(): GithubAdapter {
  const owner = process.env.DATA_REPO_OWNER;
  const repo = process.env.DATA_REPO_NAME;
  const token = process.env.DATA_REPO_PAT;
  if (!owner || !repo || !token) {
    throw new Error("DATA_REPO_OWNER / DATA_REPO_NAME / DATA_REPO_PAT 환경변수가 설정되지 않았습니다.");
  }
  return new GithubAdapter({ owner, repo, token });
}
