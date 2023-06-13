import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type NextComponentType } from "next";
import {
  type AppContext,
  type AppInitialProps,
  type AppLayoutProps,
} from "next/app";
import Head from "next/head";
import { type ReactNode } from "react";
import "~/styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App: NextComponentType<AppContext, AppInitialProps, AppLayoutProps> = ({
  Component,
  pageProps,
}: AppLayoutProps) => {
  const getLayout = Component.getLayout || ((page: ReactNode) => <>{page}</>);

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>Grab Your Youtube</title>
        <meta name="description" content="Grab Your Youtube" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {getLayout(<Component {...pageProps} />)}
    </QueryClientProvider>
  );
};

export default App;
