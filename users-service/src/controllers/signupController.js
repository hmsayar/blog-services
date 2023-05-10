const bcrypt = require("bcrypt")
const User = require("../model/User")
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");

const registerUser = async (req, res) => {
    const { user, password, email } = req.body;
    if (!user || !password || !email)
        return res
            .status(400)
            .json({ message: "Username, email, and password required" });
    const duplicateUser = await User.findOne({ username: user }).exec();
    if (duplicateUser) return res.status(409).json("This username already exists.");

    const duplicateEmail = await User.findOne({ email: email }).exec();
    if (duplicateEmail) return res.status(409).json("This email is already in use.");

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const verificationToken = crypto.randomBytes(32).toString("hex");
        await User.create({
            "username": user,
            "email": email,
            "password": hashedPassword,
            "verificationToken": verificationToken,
        })

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const verificationURL = `${process.env.userServiceUrl}/users/verify/${verificationToken}`;
        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: "Account Verification",
            html: `Click <a href="${verificationURL}">here</a> to verify your account.`,
        };

        await sgMail.send(msg);


        res.status(201).json({ success: `Verification email sent to ${email}.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports = { registerUser }