const jwt = require("jsonwebtoken");
const User = require("../model/User");
const fs = require("fs");
const path = require("path");

const publicKeyPath = path.resolve(__dirname, "..//keys/public-key.pem");
const publicKey = fs.readFileSync(publicKeyPath, "utf8");

const privateKeyPath = path.resolve(__dirname, "../keys/private-key.pem");
const privateKey = fs.readFileSync(privateKeyPath, "utf8");

const refreshUser = async (req,res)=>{
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) return res.sendStatus(403); 

    jwt.verify(
        refreshToken,
        publicKey,
        (err, decoded) => {
            if (err || foundUser.username !== decoded.username) return res.sendStatus(403);
            const userRoles = Object.values(foundUser.roles);
            const accessToken = jwt.sign(
                {
                    UserInfo: {
                        userId: foundUser._id,
                        username: foundUser.username,
                        roles: userRoles
                    }
                },
                privateKey,
                { expiresIn: "10s", algorithm:"RS256" }
            );
            res.json({ userRoles, accessToken })
        }
    );
}

module.exports = {refreshUser}