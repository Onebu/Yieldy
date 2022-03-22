const Co = require('../models/coModel');
const System = require("../models/systemModel");
const Device = require('../models/deviceModel');
const User = require('../models/userModel');
const Status = require('../models/statusModel');
const Company = require('../models/companyModel');
const shortid = require('shortid');
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

//GET all device stored in database
exports.getAll = (req, res, next) => {
    Device.find()
        .exec()
        .then(docs => {
            res.status(200).json(docs);
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

//Create a device to db
exports.create = (req, res, next) => {
    System.findOne({ _id: req.body.system }, function (err, system) {
        if (!system) {
            return res.status(404).json({
                error: "System Not Found"
            });
        }
        //Check the length of devices that the system already had first 
        //We should only add a system when the length is lower than the limit
        if (system.devices !== undefined && system.devices.length < Number(process.env.DEVICE_LIMIT_PER_SYS)) {

            //If the condition is satisfied , then we create the device and save it to db
            device = new Device({
                _id: mongoose.Types.ObjectId(),
                name: req.body.name,
                statusCode: shortid.generate(),
                system: req.body.system
            });
            device.save()
                .then(result => {
                    if (result) {
                        //After saving if to db ,we should update system by pushing it to the system's device list
                        System.updateOne({ _id: req.body.system }, {
                            $push: { devices: result._id }
                        }, { new: true }).exec()
                            .then(re => {
                                res.status(201).json(result);
                            }
                            )
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
            return res.status(401).json({
                error: "LIMIT EXCEED"
            });
        }
    });
};
//Get device from db by id
exports.getById = (req, res, next) => {
    const id = req.params.deviceId;
    Device.findById(id)
        .populate("system")
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(doc);
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
};
//Delete a device by id
exports.delete = (req, res, next) => {
    const id = req.params.deviceId;
    Device.findById(id, function (error, device) {
        //Remove the device from db first 
        device.remove(function (err) {
            if (err) {
                res.status(500).json({
                    error: err
                });
            } else {
                //Then we shoudl update the system's list by pulling it out
                System.updateOne({ _id: device.system }, {
                    $pull: { devices: device._id }
                }, { new: true }).exec()
                    .then(re => {
                        if (re) {
                            res.status(200).json({
                                message: "Device Deleted"
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
    });
};
//Get logged user's related (all system that the user is participating ) devices
exports.getMe = (req, res, next) => {
    if (req.userData.role === "co") {
        //If the user is an owner, then we should return all the system's devices
        Co.findById(req.userData.userId, function (error, user) {
            System.find({
                company: { $in: user.company }
            })
                .populate("devices")
                .exec()
                .then(docs => {
                    if (docs) {
                        res.status(200).json(docs.map(doc => {
                            return (doc.devices)

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
            if (error) {
                res.status(500).json({
                    error: err
                });
            }
        });
    } else {
        //If the user is an admin or technician, then we should check what system is the user participating then we return the result
        User.findById(req.userData.userId, function (error, user) {
            System.find({
                $or:
                    [{ admins: { $in: user._id } },
                    { technicians: { $in: user._id } },
                    ]
            })
                .populate("devices")
                .exec()
                .then(docs => {
                    if (docs) {
                        res.status(200).json({
                            devices: docs.map(doc => {
                                return {
                                    devices: doc.devices
                                }
                            })
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
            if (error) {
                res.status(500).json({
                    error: err
                });
            }
        });
    }
}

// bGet all related devices
exports.getRelatedDevices = (req, res, next) => {
    Company.find({
        $or: [
            { owner: req.userData.userId },
            { admins: { $all: [req.userData.userId] } },
            { technicians: { $all: [req.userData.userId] } }
        ]
    })
        .populate({
            path: 'systems',
            populate: 'devices'
        })
        .exec()
        .then(docs => {
            if (docs) {
                let systems = docs.map(doc => {
                    return (doc.systems)
                });
                console.log(systems);
                let devices = [];
                for (var i = 0; i < systems[0].length; i++) {
                    if (req.userData.role === "co"
                        || systems[0][i].admins.includes(req.userData.userId)
                        || systems[0][i].technicians.includes(req.userData.userId)) {
                        systems[0][i].devices.map(device => {
                            devices.push(device)
                        });
                    }
                }
                res.status(200).json(devices)

            } else {
                res.status(404).json({
                    error: "Nothing To Show"
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err.message
            });
        });
};