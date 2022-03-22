const Co = require('../models/coModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const System = require('../models/systemModel');
const Company = require('../models/companyModel');
const { Expo } = require('expo-server-sdk')
const mongoose = require("mongoose");
const { roles } = require('../middleware/roles')
//Import Pusher first ,then we will use it for our noticication system
var Pusher = require('pusher');
//Here we add our configuration information to create the variable pusher
var pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    encrypted: true
});


//Every controller have their grantAccess function to controll the access permission
//The permission that user should be granted is declared in every routes file.
exports.grantAccess = function (action, resource) {
    return async (req, res, next) => {
        try {
            const permission = roles.can(req.userData.role)[action](resource);
            if (!permission.granted) {
                return res.status(401).json({
                    error: "Access Denied"
                });
            }
            next()
        } catch (error) {
            next(error)
        }
    }
}

//get all message in db
exports.getAll = (req, res, next) => {

    Message.find()
        .sort('dataAdded')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                comments: docs.map(doc => {
                    return {
                        _id: doc.id,
                        publisher: doc.publisher,
                        content: doc.content,
                        system: doc.system
                    }
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

//get message by id
exports.getById = (req, res, next) => {

    const id = req.params.messageId;
    //Nested 3rd level deep populate, in order to get it's related (parents) messages and their publisher's information
    Message.findById(id)
        .populate({
            path: 'task device publisher reply ',
            populate: [{
                path: 'publisher task device profileImage',
                populate: [{ path: 'profileImage' }]
            },
            ],
        })
        .exec()
        .then(doc => {
            if (doc) {
                if (doc.publisher === null) {
                    //If the publisher is equal to null , the user should be an owner, so we have to 
                    //Fetch their's information from company and populate the owner's information
                    Company.findOne({ systems: doc.system })
                        .populate({
                            path: 'owner',
                            populate: { path: 'profileImage' },
                        })
                        .exec()
                        .then(re => {
                            if (re) {
                                //Replace the null profile to the owner's 
                                doc.reply.forEach((element, index) => {
                                    if (!!!element.publisher) {
                                        element.publisher = re.owner;
                                    }
                                });
                                if (!!!doc.publisher) {
                                    doc.publisher = re.owner
                                }
                                res.status(200).json(doc)
                            } else {
                                res.status(200).json(doc)
                            }
                        })
                } else {
                    //If it's not null, the doc should be return normally
                    res.status(200).json(doc)
                }

            } else {
                res.status(404).json({
                    error: "Message Not Found"
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};


//get message by system
exports.getBySystem = (req, res, next) => {

    const id = req.params.systemId;
    Message.find({ system: id })
        .populate({
            path: 'task device publisher',
            populate: { path: 'profileImage' },
        })
        .sort('-dataAdded')
        .exec()
        .then(docs => {
            if (docs) {
                //Get the profile for company owner
                Company.findOne({ systems: { $in: id } })
                    .populate({
                        path: 'owner',
                        populate: { path: 'profileImage' },
                    })
                    .exec()
                    .then(re => {
                        if (re) {
                            docs.forEach((element, index) => {
                                if (!!!element.publisher) {
                                    element.publisher = re.owner;
                                }
                            })
                            res.status(200).json(docs)
                        } else {
                            res.status(404).json({
                                error: "Message Not Found"
                            });
                        }
                    })
            } else {
                res.status(404).json({
                    error: "Message Not Found"
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

//Get logged user's message (by user's token)
exports.getMe = (req, res, next) => {

    Message.find({ publisher: req.userData.userId })
        .exec()
        .then(docs => {
            if (docs) {
                res.status(200).json(docs);
            } else {
                res.status(404).json({
                    error: "Message Not Found"
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });

};

//Post a message to database
exports.create = (req, res, next) => {

    System.findOne({ _id: req.body.system }, function (err, system) {
        if (!system) {
            return res.status(404).json({
                error: "System Not Found"
            });
        }
        if (req.userData.role === "co" || system.admins.includes(req.userData.userId) || system.technicians.includes(req.userData.userId)) {
            const message = new Message({
                _id: mongoose.Types.ObjectId(),
                publisher: req.userData.userId,
                system: req.body.system,
                content: req.body.content,
                task: req.body.task,
                device: req.body.device,
                dataAdded: new Date(),
            });
            message.save()
                .then(result => {
                    System.findOne({ _id: req.body.system }, function (err, system) {
                        if (!!system && system.pushNodes) {
                            if (!!req.body.pushNode) {
                                let expo = new Expo();
                                // Create the messages that you want to send to clients
                                let messages = [];
                                for (let pushToken of system.pushNodes) {
                                    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

                                    // Check that all your push tokens appear to be valid Expo push tokens
                                    if (!Expo.isExpoPushToken(pushToken) || pushToken === req.body.pushNode) {
                                        continue;
                                    }
                                    if (!!req.body.task && !!req.body.device) {
                                        messages.push({
                                            to: pushToken,
                                            sound: 'default',
                                            body: "A user publshed new message that mentioned a device and a task in system " + system.name,
                                        })
                                    } else if (!!req.body.device) {
                                        messages.push({
                                            to: pushToken,
                                            sound: 'default',
                                            body: "A user publshed new message that mentioned a device in system " + system.name,
                                        })
                                    } else if (!!req.body.task) {
                                        messages.push({
                                            to: pushToken,
                                            sound: 'default',
                                            body: "A user publshed new message that mentioned a task in system " + system.name,
                                        })
                                    } else {
                                        messages.push({
                                            to: pushToken,
                                            sound: 'default',
                                            body: "A user publshed new message in system " + system.name,
                                        })
                                    }
                                    expo.sendPushNotificationsAsync(messages);
                                }
                            } else {
                                let expo = new Expo();
                                // Create the messages that you want to send to clients
                                let messages = [];
                                for (let pushToken of system.pushNodes) {
                                    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

                                    // Check that all your push tokens appear to be valid Expo push tokens
                                    if (!Expo.isExpoPushToken(pushToken) || pushToken === req.body.pushNode) {
                                        continue;
                                    }
                                    if (!!req.body.task && !!req.body.device) {
                                        messages.push({
                                            to: pushToken,
                                            sound: 'default',
                                            body: "A user publshed new message that mentioned a device and a task in system " + system.name,
                                        })
                                    } else if (!!req.body.device) {
                                        messages.push({
                                            to: pushToken,
                                            sound: 'default',
                                            body: "A user publshed new message that mentioned a device in system " + system.name,
                                        })
                                    } else if (!!req.body.task) {
                                        messages.push({
                                            to: pushToken,
                                            sound: 'default',
                                            body: "A user publshed new message that mentioned a task in system " + system.name,
                                        })
                                    } else {
                                        messages.push({
                                            to: pushToken,
                                            sound: 'default',
                                            body: "A user publshed new message in system " + system.name,
                                        })
                                    }
                                    expo.sendPushNotificationsAsync(messages);
                                }
                            }
                        }
                    })
                    res.status(201).json({
                        message: "message created",
                        createdMessage: {
                            result
                        }
                    });
                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
        } else {
            return res.status(401).json({
                error: "Access Denied"
            });
        }
    });


}

//Reply a message to database
exports.reply = (req, res, next) => {
    Message.findOne({ _id: req.body.replyto })
        .exec()
        .then(re => {
            if (re) {
                const message = new Message({
                    _id: mongoose.Types.ObjectId(),
                    publisher: req.userData.userId,
                    system: re.system,
                    content: req.body.content,
                    task: re.task,
                    device: re.device,
                    reply: re.reply.concat(re._id),
                    dataAdded: new Date(),
                });
                message.save()
                    .then(result => {
                        pusher.trigger('my-channel', result.system, {
                            "message": "A user sent message"
                        });
                        res.status(201).json({
                            message: "message created",
                            createdMessage: {
                                result
                            }
                        });
                    })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });
            } else {
                res.status(404).json({
                    error: "Message Not Found"
                });
            }
        })
}