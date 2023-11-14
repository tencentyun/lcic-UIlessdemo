import type { Metadata } from "next";
import "./globals.css";
import "./bootstrap.min.css";
import Script from "next/script";
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Script src="/boot/bootstrap.bundle.min.js"></Script>
      <body className={"d-flex flex-column h-100"}>{children}</body>
    </html>
  );
}
