import type {
  NextComponentType,
  NextPageContext,
  NextLayoutComponentType,
} from "next";
import type { AppProps } from "next/app";
import { type Db, type MongoClient } from "mongodb";

declare global {
  namespace NodeJS {
    interface Global {
      db: Db;
      client: MongoClient;
      queueResponse: NextApiResponse;
    }
  }
}

declare module "next" {
  type NextLayoutComponentType<P = object> = NextComponentType<
    NextPageContext,
    any,
    P
  > & {
    getLayout?: (page: ReactNode) => ReactNode;
  };
}

declare module "next/app" {
  type AppLayoutProps<P = object> = AppProps & {
    Component: NextLayoutComponentType;
  };
}

declare namespace React {
  interface HTMLAttributes<T> extends DOMAttributes<T> {
    css?: any;
  }
}
