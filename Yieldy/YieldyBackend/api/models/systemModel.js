const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SystemSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String, required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: false,
        ref: 'company'
    },
    admins: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }],
    },
    technicians: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }],
    },
    devices: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'device'
        }],
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'task'
    }],
    pushNodes: [{
        type: String
    }]
});

const System = mongoose.model('system', SystemSchema);

module.exports = System;