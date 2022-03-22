const mongoose = require("mongoose");

const DeviceSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        reqiured: true
    },
    statusCode: {
        type: String,
        required: true
    }, 
    system: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'system',
        required: true
    },
    lastUpdated: {
        type: String,
    },
});


const Device = mongoose.model("device", DeviceSchema);

module.exports = Device;