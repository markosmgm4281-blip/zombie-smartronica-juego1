import Head from 'next/head'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Zombie Smartronica</title>
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#020617" />
        <link rel="apple-touch-icon" href="/Icon-192.png" />

        {/* --- Si vas a usar AdSense pega tu script aquí: reemplaza ca-pub-XXXXXXXX */}
        {/* <script data-ad-client="ca-pub-XXXXXXXXXXXXXXX" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script> */}
      </Head>
      <Component {...pageProps} />
    </>
  )
}
