const Co = require('../models/coModel');
const Task = require('../models/taskModel');
const User = require('../models/userModel');
const System = require("../models/systemModel");
const mongoose = require("mongoose");
const { Expo } = require('expo-server-sdk')
const { roles } = require('../middleware/roles')

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

//Get all the tasks stored in db
exports.getAll = (req, res, next) => {
    Task.find()
        .exec()
        .then(docs => {
            res.status(200).json(docs);
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
};
//Post a task to databae
exports.create = (req, res, next) => {
    task = new Task({
        _id: mongoose.Types.ObjectId(),
        publisher: req.userData.userId,
        content: req.body.content,
        system: req.body.system,
        status: req.body.status,
        dataAdded: new Date(),
        duedate: new Date(req.body.duedate)
    });
    task.save()
        .then(result => {
            if (result) {
                //When we save the task , we should also update the system's taks list 
                System.updateOne({ _id: task.system }, {
                    $push: { tasks: task._id }
                }, { new: true })
                    .exec()
                    .then(re => {
                        if (re) {
                            System.findOne({ _id: task.system }, function (err, system) {
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
                                            messages.push({
                                                to: pushToken,
                                                sound: 'default',
                                                body: "A new task is created in system " + system.name,
                                            })
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
                                            messages.push({
                                                to: pushToken,
                                                sound: 'default',
                                                body: "A new task is created in system " + system.name,
                                            })
                                            expo.sendPushNotificationsAsync(messages);
                                        }
                                    }
                                }
                            })
                            res.status(201).json({
                                message: "Created task successfully",
                                createdTask: {
                                    content: result.content,
                                    status: result.status
                                }
                            });
                        } else {
                            res.status(404).json({
                                error: "System Not Found"
                            });
                        }
                    })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};
//Get task by id
exports.getById = (req, res, next) => {
    const id = req.params.taskId;
    Task.findById(id)
        .populate('technicians publisher')
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({
                    error: "Task Not Found"
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};
//Function that we use to fetch all the tasks by system Id 
exports.getBySystem = (req, res, next) => {
    const id = req.params.systemId;
    Task.find({ system: id })
        .populate("publisher")
        .exec()
        .then(docs => {
            if (docs) {
                res.status(200).json(docs);
            } else {
                res.status(404).json({
                    error: "Task Not Found"
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

//Delete a task in db by its id
exports.delete = (req, res, next) => {
    const id = req.params.taskId;

    Task.findById(id, function (error, task) {
        if (!task) {
            res.status(404).json({
                error: "Task Not found"
            });
        } else {
            task.remove(function (err) {
                if (err) {
                    res.status(500).json({
                        error: err
                    });
                }
                else {
                    //When we delete the task , we should also remove the task from system's task list 
                    System.updateOne({ _id: task.system }, {
                        $pull: { tasks: task._id }
                    }, { new: true }).exec()
                        .then(re => {
                            if (re) {
                                res.status(200).json({
                                    message: "task deleted"
                                });
                            } else {
                                res.status(404).json({
                                    error: "System Not Found"
                                });
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err
                            });
                        });
                }
            });
        }
    });
};
//Update a task by id
exports.update = (req, res, next) => {

    const id = req.params.taskId;
    userId = req.userData.userId;
    //User's will not be able to updated the publisher, system and technicians with this function
    if (req.body.publisher || req.body.system || req.body.technicians) {
        return res.status(401).json({
            error: "You don't have enough permission to perform this action"
        });
    } else {
        Task.updateOne({ _id: id }, {
            $set:
                req.body
        }, { new: true }).exec()
            .then(result => {
                if (result) {
                    Task.findById(id)
                        .populate("system")
                        .exec()
                        .then(doc => {
                            if (doc) {
                                if (!!doc.system.pushNodes) {
                                    if (!!req.body.pushNode) {
                                        let expo = new Expo();
                                        // Create the messages that you want to send to clients
                                        let messages = [];
                                        for (let pushToken of doc.system.pushNodes) {
                                            // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

                                            // Check that all your push tokens appear to be valid Expo push tokens
                                            if (!Expo.isExpoPushToken(pushToken) || pushToken === req.body.pushNode) {
                                                continue;
                                            }
                                            messages.push({
                                                to: pushToken,
                                                sound: 'default',
                                                body: "A new task of content" + doc.content+ "has been updated in system " + doc.system.name,
                                            })
                                            expo.sendPushNotificationsAsync(messages);
                                        }
                                    } else {
                                        let expo = new Expo();
                                        // Create the messages that you want to send to clients
                                        let messages = [];
                                        for (let pushToken of doc.system.pushNodes) {
                                            // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

                                            // Check that all your push tokens appear to be valid Expo push tokens
                                            if (!Expo.isExpoPushToken(pushToken) || pushToken === req.body.pushNode) {
                                                continue;
                                            }
                                            messages.push({
                                                to: pushToken,
                                                sound: 'default',
                                                body: "A new task of content" + doc.content+ "has been updated in system " + doc.system.name,
                                            })
                                            expo.sendPushNotificationsAsync(messages);
                                        }
                                    }
                                }
                            } else {
                                res.status(404).json({
                                    error: "Task Not Found"
                                });
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });
                    res.status(200).json({
                        message: "updated"
                    });
                } else {
                    res.status(404).json({
                        error: "Task Not Found"
                    });
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    }
};
//Assign technician to a task
exports.assign = (req, res, next) => {

    const id = req.params.taskId;
    userId = req.body.userId;
    Task.findById(id, function (err, task) {
        if (err) {
            res.status(500).json({
                error: err
            });
        }
        else if (task.technicians !== undefined && task.technicians.length >= process.env.TECHNICIAN_LIMIT_PER_TASK) {
            res.status(401).json({
                error: "You Have Already Reached The Limit"
            });
        } else {
            task.technicians.push(userId);
            task.save(function (err) {
                if (err) { return res.status(500).send({ error: err }); }
                res.status(200).json({ message: "Updated" });
            });
        }
    })
};

//Revoke a technician from task
exports.revoke = (req, res, next) => {

    const id = req.params.taskId;
    userId = req.body.userId;
    Task.findById(id, function (err, task) {
        if (err) {
            res.status(500).json({
                error: err
            });
        }
        else if (task.technicians === undefined || task.technicians.length == 0) {
            res.status(400).json({
                error: "Invalid Request"
            });
        } else {
            task.technicians.pull(userId);
            task.save(function (err) {
                if (err) { return res.status(500).send({ error: err }); }
                res.status(200).json({ message: "Updated" });
            });
        }
    })

};

//Function that we can use it to get all the task related to logged user by the access token
exports.getMe = (req, res, next) => {
    userId = req.userData.userId;
    Task.find({
        $or:
            [{ technicians: { $in: userId } },
            { publisher: userId },
            ]
    })
        .populate("publisher")
        .exec()
        .then(result => {
            if (result) {
                res.status(200).json(result)
            } else {
                res.status(404).json({
                    error: "Task Not Found"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}