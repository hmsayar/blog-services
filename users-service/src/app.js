require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const connectDB = require("./config/dbConn")
const cookieParser = require("cookie-parser");

app.use(express.urlencoded({ extended: false }));

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});


connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());


app.use("/users", require("./routes/users"))


const PORT = process.env.PORT || 3000;
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});