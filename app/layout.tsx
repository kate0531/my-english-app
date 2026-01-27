import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "English Conversation Chat",
  description: "영어 학습 채팅형 교정 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
