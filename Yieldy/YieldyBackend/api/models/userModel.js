const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String, required: true, unique: true
    },
    email: {
        type: String,
        required: true,
        immutable: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'technician',
        enum: ["admin", "technician"]
    },
    confirmed: {
        type: Boolean, default: false
    },
    company: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "company"
    }],
    profileImage: {
        type: mongoose.Schema.Types.ObjectId, ref: "imageUpload"
    },
    name: {
        type: String
    },
});

const User = mongoose.model('user', UserSchema);

module.exports = User;