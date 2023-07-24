import { type NextComponentType } from "next";
import {
  type AppContext,
  type AppInitialProps,
  type AppLayoutProps,
} from "next/app";
import Head from "next/head";
import { type ReactNode } from "react";
import "~/styles/globals.css";
import { SWRConfig } from "swr";
import { ToastProvider } from "~/contexts/ToastContext";

const App: NextComponentType<AppContext, AppInitialProps, AppLayoutProps> = ({
  Component,
  pageProps,
}: AppLayoutProps) => {
  const getLayout = Component.getLayout || ((page: ReactNode) => <>{page}</>);

  return (
    <SWRConfig value={{ revalidateOnFocus: false }}>
      <ToastProvider>
        <Head>
          <title>Grab Your Youtube</title>
          <meta name="description" content="Grab Your Youtube" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {getLayout(<Component {...pageProps} />)}
      </ToastProvider>
    </SWRConfig>
  );
};

export default App;
