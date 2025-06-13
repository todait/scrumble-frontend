import type { Metadata } from "next";

import { ToastProvider } from "@/shared/components/feedback/ToastProvider";
import { getFontClassNames } from "@/shared/lib/fonts";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scrumble",
  description: "AI 시대에 잃어가는 인간적 연결을 업무 환경에서 되찾자",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={getFontClassNames()}
        suppressHydrationWarning={true}
      >
        <Providers>
          {children}
          <ToastProvider />
        </Providers>
      </body>
    </html>
  );
}
