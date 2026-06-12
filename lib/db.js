import mongoose from "mongoose";

const globalForMongoose = globalThis;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

// How long to wait before retrying after a failed connection attempt.
// During this window connectToDatabase() throws immediately (0ms) instead of
// blocking for the full serverSelectionTimeoutMS on every request.
const FAILURE_COOLDOWN_MS = 15_000;

if (!globalForMongoose.mongooseCache) {
  globalForMongoose.mongooseCache = {
    conn: null,
    promise: null,
    failedAt: 0
  };
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured. Add it to your environment before starting the app.");
  }

  const cache = globalForMongoose.mongooseCache;

  // Circuit-breaker: fast-fail while MongoDB is known to be unreachable
  if (cache.failedAt && Date.now() - cache.failedAt < FAILURE_COOLDOWN_MS) {
    throw new Error("MongoDB connection unavailable");
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName: MONGODB_DB_NAME,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });
  }

  try {
    cache.conn = await cache.promise;
    cache.failedAt = 0;
  } catch (error) {
    cache.promise = null;
    cache.failedAt = Date.now();
    throw error;
  }

  return cache.conn;
}
