const Co = require('../models/coModel');
const Company = require('../models/companyModel');
const System = require('../models/systemModel');
const User = require('../models/userModel');
const Device = require('../models/deviceModel');
const { Expo } = require('expo-server-sdk')
const Task = require('../models/taskModel');
const mongoose = require("mongoose");
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

//GET all System stored in database
exports.getAll = (req, res, next) => {
    System.find()
        .exec()
        .then(docs => {
            res.status(200).json(docs);
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
};
//Create a system
exports.create = (req, res, next) => {
    Company.findOne({ owner: req.userData.userId })
        .exec()
        .then(doc => {
            if (!doc) {
                res.status(404).json({
                    error: "Company Not Found"
                });
            }
            //Check the limit first 
            if (doc.systems !== undefined && doc.systems.length >= 2) {
                res.status(400).json({
                    error: "You Have Already Reached The Limit"
                });
            } else {
                const system = new System({
                    _id: mongoose.Types.ObjectId(),
                    name: req.body.name,
                    company: doc._id
                });
                system.save()
                    .then(result => {
                        if (result) {
                            var id = result._id;
                            //Updated the company after a system is saved to db
                            Company.updateOne({ owner: req.userData.userId }, {
                                $push: { systems: id },
                            }, { new: true }).exec()
                                .then()
                                .catch(err => {
                                    res.status(500).json({
                                        error: err
                                    });
                                });
                            res.status(201).json(result);
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

}
//Get logged user's system
exports.getMe = (req, res, next) => {
    Company.find({
        $or: [
            { owner: req.userData.userId },
            { admins: { $all: [req.userData.userId] } },
            { technicians: { $all: [req.userData.userId] } }
        ]
    })
        .populate('systems')
        .exec()
        .then(docs => {
            if (docs) {
                res.status(200).json(
                    docs.map(doc => {
                        return (doc.systems)
                    })
                );
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

};
//Get system by id
exports.getById = (req, res, next) => {
    if (req.userData.role === "co") {
        //If user is an onwer, we  should find the system by the company ID in company owner collection, 
        //Because all the system is stored in in company as a list and the owner has
        //All the permission to access it 
        Co.findById(req.userData.userId)
            .exec()
            .then(user => {
                if (!!user) {
                    System.findOne({
                        _id: req.params.systemId,
                        company: { $in: user.company }
                    })
                        //Populate the related information
                        .populate({
                            path: 'company devices tasks admins technicians',
                            populate: { path: 'profileImage' },
                        })
                        .exec()
                        .then(docs => {
                            if (docs) {
                                res.status(200).json(
                                    docs
                                );
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
    } else {
        //If the user is not an owner, then we should find the company info through user collection
        User.findById(req.userData.userId)
            .exec()
            .then(user => {
                if (!!user) {
                    System.findOne({
                        _id: req.params.systemId,
                        company: { $in: user.company }
                    })
                        .populate({
                            path: 'company devices tasks admins technicians',
                            populate: { path: 'profileImage' },
                        })
                        .exec()
                        .then(docs => {
                            if (docs) {
                                res.status(200).json(
                                    docs
                                );
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


};
//Delete system by id
exports.delete = (req, res, next) => {
    const id = req.params.systemId;
    //Find the system first 
    System.findById(id, function (error, system) {
        if (system) {
            //Then we delete all the devices that is created at this system
            Device.deleteMany({
                _id: { $in: system.devices }
            }).exec()
                .then(docs => {
                    if (docs) {
                        //Then we delete all the tasks
                        Task.deleteMany({
                            _id: { $in: system.tasks }
                        }).exec()
                            .then(re => {
                                system.remove(function (err) {
                                    if (err) {
                                        res.status(500).json({
                                            error: err
                                        });
                                    } else {
                                        //Updated the company's system list in order to completely delete 
                                        //the system
                                        Company.updateOne({ owner: req.userData.userId }, {
                                            $pull: { systems: id },
                                        }, { new: true })
                                            .exec()
                                            .then(r => {
                                                if (r) {
                                                    res.status(201).json({ message: "Deleted" });
                                                } else {
                                                    res.status(404).json({
                                                        error: "Company Not Found"
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
                            })
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                });
                            });
                    } else {
                        res.status(404).json({
                            error: "Device Not Found"
                        });
                    }
                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
        } else {
            res.status(404).json({
                error: "System Not Found"
            });
        }
    });
}
//Remove an admin from system
exports.removeAdmin = (req, res, next) => {
    const id = req.params.systemId;
    userId = req.userData.userId;
    //Find the system by id then pull the admins out 
    System.updateOne({ _id: id }, {
        $pull: { admins: req.body.id }
    }, { new: true })
        .exec()
        .then(result => {
            if (result.nModified) {
                res.status(200).json({
                    message: "updated"
                });
            } else {
                res.status(404).json({
                    error: "Admin Not Found"
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });

};
//Remove a technician from system
exports.removeTechnician = (req, res, next) => {

    const id = req.params.systemId;
    userId = req.userData.userId;
    //Find the system by id then pull the technician out 
    System.updateOne({ _id: id }, {
        $pull: { technicians: req.body.id }
    }, { new: true })
        .exec()
        .then(result => {
            if (result.nModified) {
                res.status(200).json({
                    message: "Updated"
                });
            } else {
                res.status(404).json({
                    error: "Technician Not Found"
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });

};
//Assign an admin to system
exports.assignAdmin = (req, res, next) => {

    const id = req.params.systemId;
    userId = req.userData.userId;
    //Find the system and push the admin in 
    System.findOne({ _id: id }, function (err, system) {
        if (!system) {
            return res.status(404).json({
                error: "System Not Found"
            });
        }
        if (system.admins !== undefined && system.admins.length < Number(process.env.ADMIN_LIMIT_PER_SYS)) {
            system.admins.addToSet(req.body.id);
            if (!!system.pushNodes) {
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
                            body: "A new admin has been assigned to system " + system.name,
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
                            body: "A new technician has been assigned to system " + system.name,
                        })
                        expo.sendPushNotificationsAsync(messages);
                    }
                    system.save(function (err) {
                        if (err) { return res.status(500).send({ error: err }); }
                        res.status(200).json({ message: "Updated" });
                    });
                }
            }
            system.save(function (err) {
                if (err) { return res.status(500).send({ error: err }); }
                res.status(200).json({ message: "Updated" });
            });
        } else {
            return res.status(401).json({
                error: "LIMIT EXCEED"
            });
        }
    });

}
//Assign a technician to system
exports.assignTechnician = (req, res, next) => {

    const id = req.params.systemId;
    userId = req.userData.userId;
    //Same as admin
    System.findOne({ _id: id }, function (err, system) {
        if (!system) {
            return res.status(404).json({
                error: "System Not Found"
            });
        }
        if (system.technicians !== undefined && system.technicians.length < Number(process.env.TECHNICIAN_LIMIT_PER_SYS)) {
            system.technicians.addToSet(req.body.id);
            if (!!system.pushNodes) {
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
                            body: "A new technician has been assigned to system " + system.name,
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
                            body: "A new technician has been assigned to system " + system.name,
                        })
                        expo.sendPushNotificationsAsync(messages);
                    }
                    system.save(function (err) {
                        if (err) { return res.status(500).send({ error: err }); }
                        res.status(200).json({ message: "Updated" });
                    });
                }
            }
        } else {
            return res.status(401).json({
                error: "LIMIT EXCEED"
            });
        }
    });
}


exports.addPushNode = (req, res, next) => {
    const node = req.body.node;
    console.log(node);
    console.log(req.userData.userId);
    if (req.userData.role === "co") {
        Company.find({
            $or: [
                { owner: req.userData.userId },
                { admins: { $all: [req.userData.userId] } },
                { technicians: { $all: [req.userData.userId] } }
            ]
        })
            .exec()
            .then(docs => {
                if (docs) {
                    const systems = docs[0].systems;
                    System.updateMany(
                        {
                            _id: { $in: systems },
                        },
                        { '$addToSet': { 'pushNodes': node } })
                        .exec()
                        .then(result => {
                            if (result) {
                                res.status(200).json({
                                    messge: "Updated"
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
                        })
                } else {
                    res.status(404).json({
                        error: "System Not Found"
                    });
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    } else {
        Company.find({
            $or: [
                { owner: req.userData.userId },
                { admins: { $all: [req.userData.userId] } },
                { technicians: { $all: [req.userData.userId] } }
            ]
        })
            .exec()
            .then(docs => {
                if (docs) {
                    const systems = docs[0].systems;
                    System.updateMany(
                        {
                            $and: [
                                {
                                    _id: { $in: systems },
                                    $or: [{
                                        admins: { $all: [req.userData.userId] },
                                        technicians: { $all: [req.userData.userId] },
                                    }]
                                }]
                        },
                        { '$addToSet': { 'pushNodes': node } })
                        .exec()
                        .then(result => {
                            if (result) {
                                res.status(200).json({
                                    messge: "Updated"
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
                        })
                } else {
                    res.status(404).json({
                        error: "System Not Found"
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
}
