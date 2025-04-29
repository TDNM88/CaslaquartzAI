// pages/_document.js (Next.js <13)
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        {/* Apple Touch Icon (iOS) */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
