import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/shared/Providers";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MOVE OS",
  description: "개인용 이사 관리 웹앱",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" suppressHydrationWarning className={`${plexMono.variable} h-full antialiased`}>
      <head>
        {/* Pretendard(본문 서체)는 구글 폰트에 없어서 CDN link로 불러온다 — CSS @import는
            Tailwind가 생성하는 규칙들보다 뒤로 밀려나 "@import는 최상단에만" 규칙을 위반한다. */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
