const Company = require('../models/companyModel');
const User = require('../models/userModel');
const Co = require('../models/coModel');
const imageModel = require('../models/imageModel');
const refreshTokenModel = require('../models/refreshTokenModel');
const Config = require('../models/configModel');
const Token = require('../models/tokenModel');
const mongoose = require("mongoose");
const shortid = require('shortid');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var crypto = require('crypto');
const cloud = require('../configs/cloudinaryConfig');
var nodemailer = require('nodemailer');
const { roles } = require('../middleware/roles')
const path = require('path');

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


//GET all user stored in database
exports.getAll = (req, res, next) => {
    User.find()
        .exec()
        .then(docs => {
            if (docs) {
                res.status(200).json(docs);
            } else {
                res.status(404).json({
                    error: "User Not Found"
                })
            }
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

//GET user by id
exports.getById = (req, res, next) => {
    const id = req.params.userId;
    User.findById(id)
        .populate("profileImage")
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({
                    error: "User Not Found"
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

//GET logged user's information 
exports.getMe = (req, res, next) => {
    const id = req.userData.userId;
    if (req.userData.role === 'co') {
        Co.findById(id)
            .populate("company")
            .exec()
            .then(doc => {
                if (doc) {
                    imageModel.findById(doc.profileImage, function (err, result) {
                        res.status(200).json({
                            role: doc.role,
                            confirmed: doc.confirmed,
                            registered: doc.registered,
                            company: doc.company,
                            _id: doc._id,
                            email: doc.email,
                            username: doc.username,
                            profileImage: result
                        });
                    })
                        .catch(err => {
                            res.status(500).json({
                                error: err
                            });
                        });
                } else {
                    res.status(404).json({
                        error: "Company Owner Not Found"
                    });
                }
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                });
            });
    } else {
        User.findById(id)
            .populate("company profileImage")
            .exec()
            .then(doc => {
                if (doc) {
                    res.status(200).json(doc);
                } else {
                    res.status(404).json({
                        error: "User Not Found"
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


exports.createUser = (req, res, next) => {
    var type = '0';
    if (req.body.role === 'admin') {
        type = '1';
    }
    Company.findOne({ owner: req.userData.userId })
        .exec()
        .then(doc => {
            if (type === '0' &&
                doc.technicians !== undefined &&
                doc.technicians.length >= Number(process.env.TECHNICIAN_LIMIT)) {
                res.status(400).json({
                    error: "You Have Already Reached The Limit"
                });
            } else if (type === '1'
                && doc.admins !== undefined &&
                doc.admins.length >= Number(process.env.ADMIN_LIMIT)) {
                res.status(400).json({
                    error: "You Have Already Reached The Limit"
                });
            } else {
                username = shortid.generate();
                pass = shortid.generate();
                bcrypt.hash(pass, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: mongoose.Types.ObjectId(),
                            role: req.body.role,
                            email: req.body.email,
                            password: hash,
                            username: username,
                            role: req.body.role,
                            company: [doc.id]
                        });
                        user.save()
                            .then(result => {
                                var id = result._id;
                                if (req.body.role === 'admin') {
                                    Company.updateOne({ owner: req.userData.userId }, {
                                        $push: { admins: id },
                                    }, { new: true }).exec()
                                        .then(re => {
                                            if (re) {
                                                const config = new Config({
                                                    _id: mongoose.Types.ObjectId(),
                                                    user: result._id
                                                });
                                                config.save();
                                                // Create a verification token for this user
                                                var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
                                                // Save the verification token
                                                token.save(function (err) {
                                                    if (err) { return res.status(500).send({ error: err }); }
                                                    // Send the email
                                                    let transporter = nodemailer.createTransport({
                                                        host: 'smtp.gmail.com',
                                                        port: 587,
                                                        secure: false,
                                                        requireTLS: true,
                                                        auth: {
                                                            user: process.env.EMAIL,
                                                            pass: process.env.EMAIL_KEY
                                                        }
                                                    });
                                                    var mailOptions = {
                                                        from: 'no-reply@yieldy.com',
                                                        to: user.email,
                                                        subject: 'Account Verification Token',
                                                        text: 'Hello,\n\n' + 'Here is your username and password\n' + 'Username:'
                                                            + username + '\n Password:' +
                                                            pass + '\nPlease verify your account by clicking the link: \nhttp:\/\/' +
                                                            req.headers.host + '\/user/confirmation\/' + token.token + '.\n'
                                                    };
                                                    transporter.sendMail(mailOptions, function (err) {
                                                        if (err) { return res.status(500).send({ error: err }); }
                                                        res.status(200).send({ message: 'A verification email has been sent to ' + user.email + '.' });
                                                    });
                                                });
                                            }
                                        })
                                        .catch(err => {
                                            res.status(500).json({
                                                error: err
                                            });
                                        });
                                } else {
                                    Company.updateOne({ owner: req.userData.userId }, {
                                        $push: { technicians: id },
                                    }, { new: true }).exec()
                                        .then(re => {
                                            if (re) {
                                                const config = new Config({
                                                    _id: mongoose.Types.ObjectId(),
                                                    user: result._id
                                                });
                                                config.save();
                                                // Create a verification token for this user
                                                var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
                                                // Save the verification token
                                                token.save(function (err) {
                                                    if (err) { return res.status(500).send({ error: err }); }
                                                    // Send the email
                                                    let transporter = nodemailer.createTransport({
                                                        host: 'smtp.gmail.com',
                                                        port: 587,
                                                        secure: false,
                                                        requireTLS: true,
                                                        auth: {
                                                            user: process.env.EMAIL,
                                                            pass: process.env.EMAIL_KEY
                                                        }
                                                    });
                                                    var mailOptions = {
                                                        from: 'no-reply@yieldy.com',
                                                        to: user.email,
                                                        subject: 'Account Verification Token',
                                                        text: 'Hello,\n\n' + 'Here is your username and password\n'
                                                            + 'Username:' + username +
                                                            '\n Password:' + pass +
                                                            '\nPlease verify your account by clicking the link: \nhttp:\/\/' +
                                                            req.headers.host + '\/user/confirmation\/' + token.token + '.\n'
                                                    };
                                                    transporter.sendMail(mailOptions, function (err) {
                                                        if (err) { return res.status(500).send({ error: err }); }
                                                        res.status(200).send({ message: 'A verification email has been sent to ' + user.email + '.' });
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
                            })
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });

};

//login method
exports.login = (req, res, next) => {
    User.find({ username: req.body.username })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    error: "Combination Not Found"
                });
            } else {
                bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                    if (err) {
                        return res.status(401).json({
                            error: err.message
                        });
                    }
                    if (result) {
                        if (!user[0].confirmed) return res.status(401).send({ error: 'NOT_VERIFIED' });

                        const token = jwt.sign({
                            userId: user[0]._id,
                            role: user[0].role
                        }, process.env.JWT_KEY, {
                            expiresIn: process.env.TOKEN_LIFE //espiration of logged user
                        });
                        const refreshToken = jwt.sign({
                            userId: user[0]._id,
                            role: user[0].role
                        }, process.env.JWT_KEY_2); //Refresh token will never expire
                        const refreshTkn = new refreshTokenModel({
                            _id: mongoose.Types.ObjectId(),
                            userId: user[0]._id,
                            refreshToken: refreshToken,
                            accessToken: token,
                            role: user[0].role
                        });
                        refreshTkn.save();
                        const response = {
                            message: "Auth Successful",
                            userInfo: {
                                id: user[0].id,
                                username: user[0].username,
                                email: user[0].email,
                                role: user[0].role
                            },
                            token: token,
                            expiresIn: process.env.TOKEN_REFRESH_TIME,
                            refreshToken: refreshToken
                        }
                        return res.status(200).json(response);
                    } else {
                        return res.status(401).json({
                            error: "Combination Not Found"
                        });
                    }
                });
            }
        });
};

//Using refreshToken to update accessToken
exports.refreshToken = (req, res, next) => {
    const postData = req.body;
    // if refresh token exists
    if (postData.refreshToken) {
        refreshTokenModel.findOne({
            userId: postData.userId,
            refreshToken: postData.refreshToken
        }, function (err, refreshTkn) {
            if (err) {
                return res.status(500).send({ error: err });
            }
            if (!refreshTkn) {
                res.status(401).json({
                    error: 'Invalid Request'
                });
            } else {
                const token = jwt.sign({
                    userId: refreshTkn.userId,
                    role: refreshTkn.role
                }, process.env.JWT_KEY,
                    {
                        expiresIn: process.env.TOKEN_LIFE, //espiration of logged user
                    });

                refreshTkn.accessToken = token;
                refreshTkn.save();
                const response = {
                    accessToken: token,
                    expiresIn: process.env.TOKEN_REFRESH_TIME
                }
                res.status(200).json(response);
            }
        })
    }
}

//Delete refreshToken stored in MongoDB
exports.deleteToken = (req, res, next) => {
    const postData = req.body;
    // if refresh token exists
    if (postData.refreshToken) {
        refreshTokenModel.findOneAndDelete({
            userId: postData.userId,
            refreshToken: postData.refreshToken
        }, function (err) {
            if (err) {
                return res.status(500).send({ error: err });
            } else {
                res.status(200).json({ message: "Deleted" });
            }
        })
    }
}

//email confirmation method
exports.confirmationPost = (req, res, next) => {
    // Find a matching token
    Token.findOne({ token: req.params.token }, function (err, token) {
        if (!token) return res.status(400).send({ error: 'We Were Unable To Find A Valid Token' });
        // If we found a token, find a matching user
        User.findById({ _id: token._userId }, function (err, user) {
            if (!user) return res.status(400).send({ error: 'We Were Unable To Find A User For This Token' });
            if (user.confirmed) return res.status(400).send({ error: 'This User Has Already Been Verified' });
            // Verify and save the user
            user.confirmed = true;
            user.save(function (err) {
                if (err) { return res.status(500).send({ error: err }); }
                res.sendFile(path.dirname(require.main.filename) + '/index.html');
            });
        });
    });
};


//resend user verification mail
exports.resendTokenPost = (req, res, next) => {
    User.findOne({ username: req.body.username }, function (err, user) {
        if (!user) return res.status(400).send({ error: 'We Were Unable To find A User With That Name.' });
        if (user.confirmed) return res.status(400).send({ error: 'This Account Has Already Been Verified' });
        // Create a verification token, save it, and send email
        var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
        // Save the token
        token.save(function (err) {
            if (err) { return res.status(500).send({ error: err }); }
            // Send the email
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_KEY
                }
            });
            var mailOptions = {
                from: 'no-reply@yieldy.com',
                to: user.email, subject: 'Account Verification Token',
                text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/'
                    + req.headers.host + '\/user/confirmation\/' +
                    token.token + '.\n'
            };
            transporter.sendMail(mailOptions, function (err) {
                if (err) { return res.status(500).send({ error: err }); }
                res.status(200).send({ message: 'A Verification Email Has Been Sent To ' + user.email + '.' });
            });
        });

    });
};

//delete a user by its id 
exports.delete = (req, res, next) => {
    const id = req.params.userId;
    Company.findOne({ owner: req.userData.userId })
        .exec()
        .then(doc => {
            User.findById(id, function (error, user) {
                if (!user) return res.status(400).send({ error: 'User Not Found' });
                var type;
                if (user.role === 'admin') {
                    type = 'admins';
                } else {
                    type = 'technicians';
                }
                if (user.company.includes(doc._id)) {
                    user.remove(function (err) {
                        if (err) {
                            res.status(500).json({
                                error: err
                            });
                        }
                    });
                    if (type === 'admins') {
                        Company.updateOne({ owner: req.userData.userId }, {
                            $pull: { admins: user.id }
                        }, { new: true })
                            .catch(err => {
                                res.status(500).json({
                                    error: err.message
                                });
                            });
                    } else {
                        Company.updateOne({ owner: req.userData.userId }, {
                            $pull: { technicians: user.id }
                        }, { new: true })
                            .catch(err => {
                                res.status(500).json({
                                    error: err.message
                                });
                            });
                    }
                    Config.findOne({ user: user._id }, function (err, config) {
                        config.remove();
                    })
                    res.status(200).json({
                        message: "User Deleted"
                    });
                } else {
                    res.status(404).json({
                        error: "User Not Found"
                    });
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

/** Have to check N add to Postman**/

//Method for modify profile image
exports.addProfile = (req, res, next) => {
    try {
        var imageDetails = {
            imageName: req.body.imageName,
        }
        //USING MONGO METHOD TO CHECK IF IMAGE-NAME EXIST IN THE DB
        imageModel.find({ imageName: imageDetails.imageName }, (err, callback) => {
            //CHECKING IF ERROR OCCURRED      
            if (err) {
                res.status(500).json({
                    error: err
                })
            } else {
                var imageDetails = {
                    imageName: req.body.imageName,
                    cloudImage: req.files[0].path,
                    imageId: ''
                }
                // IF ALL THING GO WELL, POST THE IMAGE TO CLOUDINARY
                cloud.uploads(imageDetails.cloudImage).then((result) => {
                    var imageDetails = {
                        imageName: req.body.imageName,
                        cloudImage: result.url,
                        imageId: result.id
                    }
                    //THEN CREATE THE FILE IN THE DATABASE
                    imageModel.create(imageDetails, (err, created) => {
                        if (err) {
                            res.status(500).json({
                                error: err
                            })
                        } else {
                            User.updateOne({ _id: req.userData.userId }, {
                                $set:
                                    { "profileImage": created._id }
                            }).exec()
                                .then(result => {
                                    res.status(200).json({
                                        messge: "Updated"
                                    });
                                })
                                .catch(err => {
                                    res.status(500).json({
                                        error: err
                                    });
                                });
                        }
                    })
                })
            }
        });
    } catch (execptions) {
        console.log(execptions)
    }
}

exports.update = (req, res, next) => {
    const id = req.params.userId;
    if (id === req.userData.userId) {
        if (req.body.profileImage || req.body.email) {
            return res.status(401).json({
                error: "Access Denied"
            })
        } else if (req.body.password) {
            if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(req.body.password) || req.body.password.length < 8) {
                return res.status(409).json({
                    error: "Unsecured Password Format Detected"
                });
            }
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    User.updateOne({ _id: id }, {
                        $set: { password: hash }
                    }).exec()
                        .then(result => {
                            res.status(200).json({
                                messge: "Updated"
                            });
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err
                            });
                        });
                }
            });
        } else {
            if (req.body.username) {
                User.updateOne({ _id: id }, {
                    name:
                        req.body.username
                }).exec()
                    .then(result => {
                        res.status(200).json({
                            messge: "Updated"
                        });
                    })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });
            }

        }
    } else {
        return res.status(404).json({
            error: "User Not Found"
        });
    }
};


