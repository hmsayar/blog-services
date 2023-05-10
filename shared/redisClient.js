const redis = require("redis");

function createRedisClient(config) {
  const redisUrl = `redis://${config.REDIS_HOST}:${config.REDIS_PORT}`;
  const redisClient = redis.createClient({url:`${config.REDIS_URL}`});
  console.log("redisClient:", JSON.stringify(redisClient, null , 2 ))
  

  redisClient.connect()

  console.log("Attempting to connect to redis");
  redisClient.on("connect", () => {
    console.log("Connected!");
  });

  redisClient.on("error", (err) => {
    console.log(`Error:${err}`);
  });
  
  return redisClient;
}

module.exports = createRedisClient;