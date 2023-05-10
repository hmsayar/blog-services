const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const commentSchema = new Schema({
    commentContent: {
        type:String,
        required:true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    createdOn: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Content",
        required:true
    }
    
})

module.exports = mongoose.model("Comment", commentSchema);

