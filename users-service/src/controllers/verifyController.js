const User = require("../model/User")

const verifyUser = async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.verificationToken });

        if (!user) return res.status(400).json({ message: "Invalid verification token." });

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: "Account verified successfully." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = {
    verifyUser
};