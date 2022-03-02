import { createClient } from "redis";

// Redis client
const redisClient = createClient();

// Connect to redis client
async function run() {
  await redisClient.connect();
  console.log("Redis client runninng:", redisClient.isOpen); // this is true
}
run();

// Log error to the console if any occurs
redisClient.on("error", (err) => {
  console.log(err);
});

// Save to cache
export async function setKey(key: string, value: string) {
  redisClient.setEx(key, 1000000, value);
}

// Get from the cache
export function getKey(key: string) {
  return redisClient.get(key);
}