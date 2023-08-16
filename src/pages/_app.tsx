import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import Head from "next/head";
import { SWRConfig } from "swr";
import { ToastProvider } from "~/contexts/ToastContext";
import "~/styles/globals.css";

type AppProps = {
  session: Session | null;
};

const App: AppType<AppProps> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <SWRConfig value={{ revalidateOnFocus: false }}>
        <ToastProvider>
          <Head>
            <title>Grab Your Youtube</title>
            <meta name="description" content="Grab Your Youtube" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Component {...pageProps} />
        </ToastProvider>
      </SWRConfig>
    </SessionProvider>
  );
};

export default App;
