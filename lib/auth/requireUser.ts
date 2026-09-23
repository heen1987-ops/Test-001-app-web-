import { auth } from "@/auth";

export class UnauthorizedError extends Error {
  constructor() {
    super("unauthorized");
    this.name = "UnauthorizedError";
  }
}

/**
 * 모든 API 라우트 핸들러의 첫 줄에서 호출한다. 화면 쪽 로그인 여부만 믿지 않고,
 * 요청마다 다시 검사한다 — 세션이 없거나, 허용된 계정이 아니거나, 환경변수 자체가
 * 없으면(배포 설정 누락) 전부 거부한다.
 */
export async function requireAuthorizedUser(): Promise<void> {
  const allowedId = process.env.ALLOWED_GITHUB_ID;
  if (!allowedId) throw new UnauthorizedError();

  const session = await auth();
  const sessionGithubId = session?.user?.githubId;
  if (!sessionGithubId || sessionGithubId !== allowedId) throw new UnauthorizedError();
}
