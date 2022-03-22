//Imports
const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const coRoutes = require('./api/routes/coRoutes');
const imageRoutes = require('./api/routes/imageRoutes');
const companyRoutes = require('./api/routes/companyRoutes');
const userRoutes = require('./api/routes/userRoutes')
const systemRoutes = require('./api/routes/systemRoutes');
const messageRoutes = require('./api/routes/messageRoutes');
const deviceRoutes = require('./api/routes/deviceRoutes');
const taskRoutes = require('./api/routes/taskRoutes');
const configRoutes = require('./api/routes/configRoutes');
const statusRoutes = require('./api/routes/statusRoutes');
//Mongoose configuration to connect API with mongodb cluster

mongoose.Promise = global.Promise;

mongoose.connect(
    "mongodb+srv://onebu:"
    + process.env.MONGO_ATLAS_PW +
    "@cluster0-wcekj.mongodb.net/Yieldy?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    },
);


app.use(cors())

app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Routes which should handle request
app.use("/co", coRoutes);
app.use("/image", imageRoutes);
app.use("/company", companyRoutes);
app.use("/user", userRoutes);
app.use("/system", systemRoutes);
app.use("/message", messageRoutes);
app.use("/device", deviceRoutes);
app.use("/task", taskRoutes);
app.use("/config", configRoutes);
app.use("/status",statusRoutes);

//CORS settings
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method == "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, PATCH, POST, DELETE, GET")
        return res.status(200).json({});
    };
    next();
});

//ERROR handling - 404
app.use((req, res, next) => {
    res.status(404).json({
        error: "Request Not Found"
    });
});
//ERROR handling to return the response with error message
app.use((error, req, res) => {
    res.status(error.status || 500);
    res.status(404).json({
        error: error.message
    });
});

module.exports = app;