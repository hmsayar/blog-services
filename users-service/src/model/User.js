const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique:true
    },
    email: {
        type: String, 
        required:true, 
        unique:true
    },
    roles:{
        User:{
            type:String,
            default:"user"
        },
        Editor:String,
        Admin:String,
        Moderator:String
    },
    password: {
        type: String,
        required: true
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    refreshToken:String
});

module.exports = mongoose.model("User", userSchema);