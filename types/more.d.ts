import { type Db, type MongoClient } from "mongodb";

declare global {
  namespace NodeJS {
    interface Global {
      db: Db;
      client: MongoClient;
    }
  }
}

declare namespace React {
  interface HTMLAttributes<T> extends DOMAttributes<T> {
    css?: any;
  }
}
