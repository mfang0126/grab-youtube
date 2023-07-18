import { type ClientSession, type Db, MongoClient } from "mongodb";

const { MONGO_URI, MONGO_DATABASE } = process.env;

declare let global: NodeJS.Global;

const initDb = async (): Promise<Db> => {
  try {
    if (!MONGO_URI) {
      throw Error("MONGO_URI is required.");
    }

    console.log("DB is connecting.", MONGO_URI);
    global.client = await MongoClient.connect(MONGO_URI, {
      maxIdleTimeMS: 10000,
      serverSelectionTimeoutMS: 5000,
      minPoolSize: 0,
      socketTimeoutMS: 5000,
    });

    console.log("DB connected.", MONGO_URI);
    global.db = global.client.db(MONGO_DATABASE);
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
