const Co = require('../models/coModel');
const Company = require('../models/companyModel');
const User = require('../models/userModel');
const mongoose = require("mongoose");
const System = require('../models/systemModel');
const Config = require('../models/configModel');
const { roles } = require('../middleware/roles');

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
            next();
        } catch (error) {
            next(error);
        }
    }
}

//GET all company stored in database (*Should not be called at the moment)
exports.getAll = (req, res, next) => {
    Company.find()
        .exec()
        .then(docs => {
            res.status(200).json(docs);
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

//Company registration method 
exports.registerCompany = (req, res, next) => {
    Co.findById(req.userData.userId)
        .exec()
        .then(doc => {
            //At the moment every company onwer can only register one company 
            if (doc.registered) {
                res.status(403).json({
                    error: "You Have Already Registered a Company"
                });
            } else {
                company = new Company({
                    _id: mongoose.Types.ObjectId(),
                    owner: req.userData.userId,
                    name: req.body.name,
                    website: req.body.website,
                    address: req.body.address,
                    email: req.body.email,
                    phone: req.body.phone,
                    description: req.body.description,
                    registrationdate: new Date(),
                });
                company.save()
                    .then(result => {
                        var id = result._id;
                        Co.updateOne({ _id: req.userData.userId }, {
                            $push: { company: id },
                            $set: { registered: true }
                        }, { new: true }).exec()
                            .then()
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                });
                            });
                        res.status(201).json(result);
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

//Method for getting current logged user's company
exports.getMe = (req, res, next) => {
    Company.find({
        $or: [
            { owner: req.userData.userId },
            { admins: { $in: [req.userData.userId] } },
            { technicians: { $in: [req.userData.userId] } }
        ]
    })
        //Deep population (that populate systems, admins ,technicians and owner 
        //and also populate the device in every system and profile of every user)
        .populate({
            path: 'systems admins technicians owner',
            populate: { path: 'devices profileImage' },
        })
        .exec()
        .then(docs => {
            if (docs) {
                res.status(200).json(docs);
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

};

//Search company by name (*At the moment this function is not necessary for the project)
exports.searchByName = (req, res, next) => {
    Company.findOne({ name: new RegExp('^' + req.params.name + '$', "i") })
        .populate("systems admins technicians")
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}

//Get company by Id
exports.getById = (req, res, next) => {
    const id = req.params.companId;
    Company.findById(id)
        .populate('systems admins technicians')
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(doc);
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
};
//Company delete method 
exports.delete = (req, res, next) => {
    const id = req.params.companyId;
    //First we find the company by it's id and delete it
    Company.findById(id, function (error, company) {
        if (company) {
            if (company.owner == req.userData.userId) {
                company.remove(function (err) {
                    //When we delete the company, we should update company owner's profile
                    if (err) {
                        res.status(500).json({
                            error: err
                        });
                    } else {
                        Co.updateOne({ _id: req.userData.userId }, {
                            $pull: { company: id },
                            registered: false
                        }, { new: true })
                            .exec()
                            .then(result => {
                                if (result) {
                                    //And then delete every user of this company
                                    User.deleteMany({
                                        $or: [{ _id: { $in: company.admins } },
                                        { _id: { $in: company.technicians } },
                                        ]
                                    }).exec()
                                        .then(rslt => {
                                            if (rslt) {
                                                //Also delete theirs config data
                                                Config.deleteMany({
                                                    $or: [{ user: { $in: company.admins } },
                                                    { user: { $in: company.technicians } },
                                                    ]
                                                })
                                                    .exec()
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
                                    res.status(200).json({
                                        message: "Company Deleted"
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
            } else {
                return res.status(401).json({
                    error: "Access Denied"
                });
            }
        } else {
            res.status(404).json({
                erro: "Company Not Found"
            });
        }
    });
}
//Update company's infromation
exports.update = (req, res, next) => {
    const id = req.params.companyId;
    userId = req.userData.userId
    //Company owner can update certain field , but the company's name, owner, registrationdate, user and system should not be modified 
    //by this function.
    if (req.body.name || req.body.owner || req.body.registrationdate || req.body.admins || req.body.technicians || req.body.systems) {
        return res.status(401).json({
            error: "Access Denied"
        })
    } else {
        Company.updateOne({ _id: id, owner: userId }, {
            $set: req.body
        }, { new: true }).exec()
            .then(result => {
                if (result) {
                    res.status(200).json({
                        message: "Updated"
                    });
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
};
//delete admin from company
exports.deleteAdmin = (req, res, next) => {
    const id = req.params.companyId;
    userId = req.userData.userId;
    //Update the company list first 
    Company.updateOne({ _id: id, owner: userId }, {
        $pull: { admins: req.body.id }
    }, { new: true })
        .exec()
        .then(result => {
            if (result) {
                //Then delete the user by id
                User.deleteOne({
                    _id: req.body.id
                })
                    .exec()
                    .then(doc => {
                        //Also delete the config information of this user
                        Config.deleteOne({ user: req.body.id })
                            .exec()
                            .then(rslt => {
                                System.updateOne({ company: result._id }, {
                                    $pull: { admins: req.body.id }
                                }, { new: true })
                                    .exec()
                                    .then(re => {
                                        res.status(200).json({
                                            message: "Updated"
                                        });
                                    })
                                    .catch(err => {
                                        res.status(500).json({
                                            error: err
                                        });
                                    });
                            })
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                });
                            });
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
//delete technicians from company
exports.deleteTechnicians = (req, res, next) => {
    const id = req.params.companyId;
    userId = req.userData.userId;
    //same as admin, we should remove the user from company first 
    Company.updateOne({ _id: id, owner: userId }, {
        $pull: { technicians: req.body.id }
    }, { new: true })
        .exec()
        .then(result => {
            if (result) {
                //then we delete the user by id
                User.deleteOne({
                    _id: req.body.id
                })
                    .exec()
                    .then(doc => {
                        //Finally, delete the config info
                        Config.deleteOne({ user: req.body.id })
                            .exec()
                            .then(rslt => {
                                System.updateOne({ company: result._id }, {
                                    $pull: { technicians: req.body.id }
                                }, { new: true })
                                    .exec()
                                    .then(re => {
                                        res.status(200).json({
                                            message: "Updated"
                                        });
                                    })
                                    .catch(err => {
                                        res.status(500).json({
                                            error: err
                                        });
                                    });
                            })
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                });
                            });
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