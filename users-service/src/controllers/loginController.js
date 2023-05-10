const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../model/User");
const fs = require("fs");
const path = require("path");

const privateKeyPath = path.resolve(__dirname, "../keys/private-key.pem");
const privateKey = fs.readFileSync(privateKeyPath, "utf8");

const loginUser = async (req,res)=>{
    const { user, password } = req.body
    if (!user || !password) return res.status(400).json({ "message": "Username and password are required." });
    const foundUser = await User.findOne({ username: user }).exec();
    if (!foundUser) return res.sendStatus(401);

    
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (isMatch) {
        const userRoles = Object.values(foundUser.roles).filter(Boolean);
        const username = foundUser.username
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    userId: foundUser._id,
                    username: foundUser.username,
                    roles: userRoles
                }
            },
            privateKey,
            { expiresIn: "2d", algorithm:"RS256" }
        );
        const refreshToken = jwt.sign(
            {
                username: foundUser.username,
                userId: foundUser._id
            },
            privateKey,
            { expiresIn: "5d", algorithm: "RS256" }
        );
        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();


        res.cookie("jwt", refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

        res.json({ userRoles, accessToken, username });

    } else {
        res.sendStatus(401);
    }
}

module.exports = {loginUser}