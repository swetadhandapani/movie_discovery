import dotenv from "dotenv";

dotenv.config();

const required = ["MONGODB_URI", "WATCHMODE_API_KEY"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  watchmodeApiKey: process.env.WATCHMODE_API_KEY,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  cacheTtlMs: Number(process.env.CACHE_TTL_MS || 120000),
  watchmodeRegion: process.env.WATCHMODE_REGION || "US"
};
