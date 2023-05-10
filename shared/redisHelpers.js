const axios = require("axios");

function createRedisHelpers(config) {
  const redisClient = config.redisClient;
  console.log(config.userServiceUrl)
  async function getUser(userId) {
    try {
      let cachedUserJson = await redisClient.get(userId);

      if (cachedUserJson) {
        console.log("from cache")
        return JSON.parse(cachedUserJson);
      } else {
        // console.log(`${process.env.userServiceUrl}/users/${userId}`)
        console.log("from http")
        const response = await axios.get(`${config.userServiceUrl}/users/${userId}`);
        const user = response.data;
        await redisClient.set(userId, JSON.stringify(user));
        return user;
      }
    } catch (error) {
      return null;
    }
  }
  
  async function getLatestPosts(){
    try {
      const posts = await redisClient.lRange("latest_posts", 0, 9);
      return posts.map(post => JSON.parse(post));
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  return {
    getUser,
    getLatestPosts,
  };
}


module.exports = createRedisHelpers;