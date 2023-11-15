"use client";
// import type { Metadata } from "next";
import "./globals.css";
import "./bootstrap.min.css";
import Script from "next/script";
import { BootProvider, BootContext } from "../../contexts/boot.context";
import { useState } from "react";
// export const metadata: Metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let [globalBoot, setGlobal] = useState(null);
  let bootOnload = () => {
    let global = window as any;
    setGlobal(global.bootstrap);
  };

  return (
    <html lang="en">
      <BootProvider
        state={{
          boot: globalBoot,
          tcic: null,
        }}
      >
        <Script
          src="/boot/bootstrap.bundle.min.js"
          onLoad={bootOnload}
        ></Script>
        <body className={"d-flex flex-column h-100"}>{children}</body>
      </BootProvider>
    </html>
  );
}
