import { afterEach, describe, expect, it, vi } from "vitest";

// auth.ts는 NextAuth(...)를 모듈 로드 시점에 실제로 구성하므로, 여기서는 auth() 함수만
// 가짜로 대체해서 requireAuthorizedUser의 판단 로직만 독립적으로 검증한다.
// vi.mock은 vitest에 의해 아래 import보다 먼저 실행되도록 끌어올려진다.
const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));
vi.mock("@/auth", () => ({ auth: authMock }));

import { requireAuthorizedUser, UnauthorizedError } from "./requireUser";

describe("requireAuthorizedUser", () => {
  const originalAllowedId = process.env.ALLOWED_GITHUB_ID;

  afterEach(() => {
    process.env.ALLOWED_GITHUB_ID = originalAllowedId;
    authMock.mockReset();
  });

  it("ALLOWED_GITHUB_ID가 없으면 세션과 무관하게 거부한다 (열어두지 않는다)", async () => {
    delete process.env.ALLOWED_GITHUB_ID;
    authMock.mockResolvedValue({ user: { githubId: "255897129" } });
    await expect(requireAuthorizedUser()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("세션이 없으면 거부한다", async () => {
    process.env.ALLOWED_GITHUB_ID = "255897129";
    authMock.mockResolvedValue(null);
    await expect(requireAuthorizedUser()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("허용되지 않은 계정이면 거부한다", async () => {
    process.env.ALLOWED_GITHUB_ID = "255897129";
    authMock.mockResolvedValue({ user: { githubId: "999999999" } });
    await expect(requireAuthorizedUser()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("허용된 계정이면 통과한다", async () => {
    process.env.ALLOWED_GITHUB_ID = "255897129";
    authMock.mockResolvedValue({ user: { githubId: "255897129" } });
    await expect(requireAuthorizedUser()).resolves.toBeUndefined();
  });
});
