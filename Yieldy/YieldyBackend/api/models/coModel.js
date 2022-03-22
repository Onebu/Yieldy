const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CoSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String, required: true, unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        immutable: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'co'
    },
    confirmed: {
        type: Boolean, default: false
    },
    registered: {
        type: Boolean, default: false
    },
    company: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "company"
    }],
    profileImage: {
        type: mongoose.Schema.Types.ObjectId, ref: "imageUpload"
    }
});

const Co = mongoose.model('co', CoSchema);

module.exports = Co;