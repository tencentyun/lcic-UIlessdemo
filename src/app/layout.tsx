'use client';
// import type { Metadata } from "next";
import './globals.css';
import './bootstrap.min.css';
import Script from 'next/script';
import { BootProvider } from '../../contexts/boot.context';
import { useState } from 'react';
import { ModalProvider } from '../../contexts/modal.context';

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
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <BootProvider
        state={{
          boot: globalBoot,
          tcic: null,
          sdk: null,
          tim: null,
          myInfo: null,
          hostInfo: null,
        }}
      >
        <Script
          src={`${process.env.NEXT_PUBLIC_BASE_PATH}/boot/bootstrap.bundle.min.js`}
          onLoad={bootOnload}
        ></Script>
        <body className={'d-flex flex-column h-100'}>
          <ModalProvider>{children}</ModalProvider>
        </body>
      </BootProvider>
    </html>
  );
}
