const mongoose = require("mongoose");

const ConfigSchema = mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    content: {
        type: String
    },
    pushnotification: {
        type: Boolean,
        default: true
    }
});


const Config = mongoose.model("Config", ConfigSchema);

module.exports = Config;