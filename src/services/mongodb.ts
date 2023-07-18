import { type ClientSession, type Db, MongoClient } from "mongodb";

const { MONGODB_URI, MONGODB_DATABASE } = process.env;

declare let global: NodeJS.Global;

const initDb = async (): Promise<Db> => {
  try {
    if (!MONGODB_URI) {
      throw Error("MONGODB_URI is required.");
    }

    console.log("DB is connecting.", MONGODB_URI);
    global.client = await MongoClient.connect(MONGODB_URI, {
      maxIdleTimeMS: 10000,
      serverSelectionTimeoutMS: 5000,
      minPoolSize: 0,
      socketTimeoutMS: 5000,
    });

    console.log("DB connected.", MONGODB_URI);
    global.db = global.client.db(MONGODB_DATABASE);
    return global.db;
  } catch (err) {
    console.log("Failed to connect to MongoDB");
    console.log(err);
    throw new Error("Failed to connect to MongoDB");
  }
};

export const getSession = (): ClientSession => {
  if (global.client) {
    return global.client.startSession();
  }
  throw new Error("Fail to init mongo session");
};

export const getDb = async (): Promise<Db> => {
  if (global.db) {
    return global.db;
  }
  console.log("init db");
  return initDb();
};

export const getMongo = async (): Promise<MongoClient> => {
  if (global.client) {
    return global.client;
  }
  await initDb();
  return global.client;
};
