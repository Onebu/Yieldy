const Config = require('../models/configModel');
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

//GET all config stored in database
exports.getAll = (req, res, next) => {
    Config.find()
        .exec()
        .then(docs => {
            res.status(200).json(docs);
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

//Get config by it's id
exports.getById = (req, res, next) => {
    const id = req.params.configId;
    Config.findById(id)
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({
                    error: "Config Not Found"
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
    res.state
};

//Get config by user's access token that stores user's id 
exports.getMe = (req, res, next) => {
    const id = req.userData.userId;
    Config.findOne({ user: id })
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({
                    error: "Config Not Found"
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};


//Update the config of user by it's id
exports.update = (req, res, next) => {
    const id = req.params.configId;
    userId = req.userData.userId
    Config.findOneAndUpdate({ _id: id }, {
        $set:
            req.body
    }, { new: true }).exec()
        .then(result => {
            if (result) {
                res.status(200).json({
                    error: "Updated"
                });
            } else {
                res.status(404).json({
                    error: "Config Not Found"
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};
