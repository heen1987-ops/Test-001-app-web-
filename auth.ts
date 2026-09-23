import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

/**
 * 허용된 GitHub 계정 한 명만 로그인할 수 있게 한다. ALLOWED_GITHUB_ID가 비어 있으면
 * (배포 환경에 설정을 깜빡한 경우 포함) 무조건 거부한다 — 열어둔 채로 두지 않는다.
 */
function isAllowedGithubId(id: number | string | undefined): boolean {
  const allowed = process.env.ALLOWED_GITHUB_ID;
  if (!allowed) return false;
  return id != null && String(id) === allowed;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Vercel이 아닌 곳(Netlify 등)에 배포할 때는 요청의 Host 헤더를 자동으로 신뢰하지 않아서
  // 이 설정이 없으면 "UntrustedHost" 에러가 난다.
  trustHost: true,
  providers: [GitHub],
  callbacks: {
    async signIn({ profile }) {
      return isAllowedGithubId((profile as { id?: number } | undefined)?.id);
    },
    async jwt({ token, profile }) {
      if (profile) token.githubId = String((profile as { id?: number }).id);
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.githubId = token.githubId as string | undefined;
      return session;
    },
  },
});
