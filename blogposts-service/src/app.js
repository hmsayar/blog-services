require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn")
const listenForPostExistenceChecks  = require("./rabbitmq/listenForPostExistenceChecks")

const app = express();

app.use(express.json({ limit: "500kb" })); 
app.use(express.urlencoded({ limit: "500kb", extended: false }));

connectDB();
listenForPostExistenceChecks();

app.use(bodyParser.json());
app.use(cors());

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});


app.use("/blogposts", require("./routes/blogposts"))

const PORT = process.env.PORT || 3001;
mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});