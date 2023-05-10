const User = require("../model/User")
const createRedisClient = require("@hmsayar/shared/redisClient");
const redisClient = createRedisClient(process.env);

const getUserById = async (req, res) => {
  if (!req?.params?.userId) return res.status(400).json({ "message": "User ID required" });
  const user = await User.findOne({ _id: req.params.userId }).exec();
  if (!user) {
    return res.status(204).json({ "message": `User ID ${req.params.userId} not found` });
  }
  res.json(user);
};

const updateUser = (req, res) => {
  console.log("updateUser")
};

const deleteUser = async (req, res) => {
  if (!req?.params?.userId) return res.status(400).json({ "message": "User ID required" });
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(204).json({ "message": `User ID ${req.params.userId} not found` });
    await User.deleteOne({ _id: req.params.userId });
    await redisClient.del(req.params.userId);
    //TODO: Delete relevant comments and blogposts
    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ "message": "Internal server error" });
  }
};

module.exports = {
  getUserById,
  updateUser,
  deleteUser,
};