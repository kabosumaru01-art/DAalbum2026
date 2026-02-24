import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "R5DAアルバム",
  description: "誰でも閲覧・投稿できるデジタルアルバム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
}
