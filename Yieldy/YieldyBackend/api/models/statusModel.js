const mongoose = require("mongoose");

const statusSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    arch: {
        type: String,
    },
    cores: {
        type: Number
    },
    cpuusage: {
        type: Number
    },
    memusage: {
        type: Number
    },
    platform: {
        type: String
    },
    release: {
        type: String
    },
    uptime: {
        type: String
    },
    statusCode: {
        type: String,
        required: true
    },
    dataAdded: {
        type: Date
    },
    openedPort: {
        type: Object
    }
});


const Status = mongoose.model("status", statusSchema);

module.exports = Status;