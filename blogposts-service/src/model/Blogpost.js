const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogPostSchema = new Schema({
    postedBy: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    title: {
        type:String,
        required:true
    },
    post: {
        type:String,
        required:true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model("Blogpost", blogPostSchema);