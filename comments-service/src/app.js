require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn")
const listenForDeleteCommentsByPost = require("./rabbitmq/deleteCommentsByPost")




const app = express();



app.use(express.urlencoded({ extended: false }));

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});


connectDB();
listenForDeleteCommentsByPost()
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.use("/comments", require("./routes/comments"))


const PORT = process.env.PORT || 3002;
mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
