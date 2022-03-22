const mongoose = require("mongoose");

const refreshTokenSchema = mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        immutable: true
    },
    role: {
        type: String,
        required: true,
        immutable: true
    },
    refreshToken: {
        type: String,
        required: true,
        immutable: true
    },
    accessToken: {
        type:String,
        required: true
    }
});

const refreshToken = mongoose.model("refreshToken", refreshTokenSchema);

module.exports = refreshToken;