const mongoose = require("mongoose");

const TaskSchema = mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,
    publisher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        immutable: true
    },
    content: {
        type: String,
        required: true
    },
    system: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'system',
        required: true,
        immutable: true
    },
    technicians:{
        type:[{
            type:mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }]
    },
    status: {
        type: String,
        default: 'WIP',
        enum: ["WIP", "done"]
    },
    duedate: {
        type: Date,
        required: true
    },
    dataAdded: {
        type: Date ,
        required: true
    }

});
const Task = mongoose.model("task", TaskSchema);

module.exports = Task;