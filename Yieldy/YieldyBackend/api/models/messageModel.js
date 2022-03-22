const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,
    publisher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    system: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'system',
        required: true
    },
    dataAdded: {
        type: Date,
        required: true
    },
    task : {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'task'
    },
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'device'
    },
    reply: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'message'
    }],
    type: {
        type: String
    }
});


const Message = mongoose.model("message", MessageSchema);

module.exports = Message;