const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanySchema = new Schema({
_id:mongoose.Schema.Types.ObjectId,
name: {
    type:String, required:true, unique:true,immutable:true
},
owner: {
    type:mongoose.Schema.Types.ObjectId, required:true,immutable: true,ref:'co'
},
address: {
    type: String
},
website: {
    type: String
},
email: {
    type: String,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
},
phone: {
    type: String
},
description: {
    type: String
},
registrationdate: {
    type: Date,
    required: true,
    immutable: true
},
admins:{
    type:[{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }]
},
technicians:{
    type:[{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }]
},
systems:{
    type:[{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'system'
    }],
},
});


const Company = mongoose.model('company', CompanySchema);

module.exports = Company;