const Co = require('../models/coModel');
const Token = require('../models/tokenModel');
const imageModel = require('../models/imageModel');
const Company = require('../models/companyModel');
const User = require('../models/userModel');
const refreshTokenModel = require('../models/refreshTokenModel');
const Config = require('../models/configModel');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const cloud = require('../configs/cloudinaryConfig');
const path = require('path');
//import role config as roles
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

//Co signup 
exports.signup = (req, res, next) => {
    //Password validation
    if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(req.body.password) || req.body.password.length < 8) {
        return res.status(409).json({
            error: "Unsecured Password Format Detected"
        });
    } else {
        //Check if the email is already registered to the database
        Co.find({ email: req.body.email })
            .exec()
            .then(user => {
                if (user.length >= 1) {
                    return res.status(409).json({
                        error: "Mail Exists"
                    });
                } else {
                    //Hash the password to save to database
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if (err) {
                            return res.status(500).json({
                                error: err.message
                            });
                        } else {
                            //create new company owner
                            const user = new Co({
                                _id: mongoose.Types.ObjectId(),
                                email: req.body.email,
                                password: hash,
                                username: req.body.username,
                                role: req.body.role,
                                dateJoined: new Date()
                            });
                            //Create config file for created company owner and save to database
                            const config = new Config({
                                _id: mongoose.Types.ObjectId(),
                                user: user._id
                            });
                            config.save(function (err) {
                                if (err) { return res.status(500).send({ error: err }); }
                            });
                            //Save to database
                            user.save(function (err) {
                                if (err) {
                                    config.remove();
                                    return res.status(500).send({ error: err.message });
                                }
                                // Create a verification token for this company owner
                                var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
                                // Save the verification token
                                token.save(function (err) {
                                    if (err) { return res.status(500).send({ error: err }); }
                                    // Send the verification email
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
                                        text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' +
                                            req.headers.host + '\/co/confirmation\/' +
                                            token.token + '.\n'
                                    };
                                    transporter.sendMail(mailOptions, function (err) {
                                        if (err) { return res.status(500).send({ error: err }); }
                                        res.status(200).send({
                                            message: 'A verification email has been sent to '
                                                + user.email + '.'
                                        });
                                    });
                                });
                            });
                        }
                    });
                }
            });

    }



};

//Co login
exports.login = (req, res, next) => {
    Co.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    error: "Email Doesn't Exist"
                });
            } else {
                //Compare the hashed password with the password stored in dabatase
                bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                    if (err) {
                        return res.status(401).json({
                            error: err
                        });
                    }
                    if (result) {
                        if (!user[0].confirmed) return res.status(401).send({ error: 'NOT_VERIFIED' });
                        //Create jwt token
                        const token = jwt.sign({
                            userId: user[0]._id,
                            role: user[0].role
                        }, process.env.JWT_KEY,
                            {
                                expiresIn: process.env.TOKEN_LIFE, //espiration of logged user's access token
                            });
                        const refreshToken = jwt.sign({
                            userId: user[0]._id,
                            role: user[0].role
                        }, process.env.JWT_KEY_2); //Refresh token will never expire
                        //Also create and save the refresh token in order to refresh the access token
                        const refreshTkn = new refreshTokenModel({
                            _id: mongoose.Types.ObjectId(),
                            userId: user[0]._id,
                            refreshToken: refreshToken,
                            accessToken: token,
                            role: user[0].role
                        });
                        refreshTkn.save();

                        //The response contain user's id, username, email, role and the access and refresh tokens
                        const response = {
                            message: "Auth Successful",
                            userInfo: {
                                id: user[0]._id,
                                username: user[0].username,
                                email: user[0].email,
                                role: user[0].role
                            },
                            token: token,
                            expiresIn: process.env.TOKEN_REFRESH_TIME,
                            refreshToken: refreshToken
                        }
                        return res.status(200).json(response);
                    }
                    res.status(401).json({
                        error: "Combination Not Found"
                    });
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
                refreshTkn.save().catch(e => {
                    res.status(403).send({ error: r });
                });
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
//This function is called when user log out
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
        Co.findById({ _id: token._userId }, function (err, user) {
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

//Function that resend the verification email
exports.resendTokenPost = (req, res, next) => {
    //Find a registered company owner with email
    Co.findOne({ email: req.body.email }, function (err, user) {
        if (!user) return res.status(400).send({ error: 'We Were Unable To find A User With That Email.' });
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
                    + req.headers.host + '\/co/confirmation\/' +
                    token.token + '.\n'
            };
            transporter.sendMail(mailOptions, function (err) {
                if (err) { return res.status(500).send({ error: err }); }
                res.status(200).send({ message: 'A Verification Email Has Been Sent To ' + user.email + '.' });
            });
        });

    });
};

//Function to modify company owner's profile image
exports.addProfile = (req, res, next) => {
    try {
        var imageDetails = {
            imageName: req.body.imageName,
        }
        //USING MONGO METHOD TO FINd IF IMAGE-NAME EXIST IN THE DB
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
                            Co.updateOne({ _id: req.userData.userId }, {
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

//Get all company owner stored in database 
//(* This method should not be called because nobody will get enough permission to view all owner's information)
exports.getAll = (req, res, next) => {
    Co.find()
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                users: docs
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

//Search company owner by name
exports.searchByName = (req, res, next) => {
    Co.findOne({ username: new RegExp('^' + req.params.name + '$', "i") }, function (err, doc) {
        if (doc) {
            //Also find the profile image for the returned json 
            imageModel.findById(doc.profileImage, function (err, result) {
                res.status(200).json({
                    role: doc.role,
                    confirmed: doc.confirmed,
                    registered: doc.registered,
                    company: doc.company,
                    _id: doc._id,
                    email: doc.email,
                    username: doc.username,
                    profileImage: { result }
                });
            }).catch(err => {
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
}

//Get company owner by Id (*Same to the getAll funciton.)
exports.getById = (req, res, next) => {
    const id = req.params.userId;
    Co.findById(id)
        .populate('profileImage')
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(doc);
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
};

//Update company owner's profile (Password,  and username)
exports.update = (req, res, next) => {
    const id = req.params.userId;
    if (id === req.userData.userId) {
        //Company owner should update profile image with addProfile() function
        if (req.body.profileImage || req.body.email) {
            return res.status(401).json({
                error: "Access Denied"
            })
        } else if (req.body.password) { 
            //Check if user want to update password
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
                    Co.updateOne({ _id: id }, {
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
            //All the updates on others fileds shoul be called here
            Co.updateOne({ _id: id }, {
                $set:
                    req.body
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
    } else {
        return res.status(404).json({
            error: "Company Owner Not Found"
        });
    }


};

//Delete company owner by Id (*Should not be called at the moment )
exports.delete = (req, res, next) => {
    const id = req.params.userId;
    Co.findById(id, function (error, co) {
        if (co) {
            Company.findOne({ owner: co._id }, function (error, company) {
                if (company) {
                    company.remove(function (err) {
                        if (err) {
                            res.status(500).json({
                                error: err
                            });
                        } else {
                            User.deleteMany({
                                $or:
                                    [{ _id: { $in: company.admins } },
                                    { _id: { $in: company.technicians } },
                                    ]
                            }).exec()
                                .then(result => {
                                    if (result) {
                                        Config.deleteMany({
                                            $or:
                                                [{ user: { $in: company.admins } },
                                                { user: { $in: company.technicians } },
                                                ]
                                        })
                                            .exec()
                                            .then(re => {
                                                if (re) {
                                                    co.remove(function (err) {
                                                        if (err) {
                                                            res.status(500).json({
                                                                error: err
                                                            });
                                                        } else {
                                                            Config.find({ user: co._id }, function (err, config) {
                                                                if (config) {
                                                                    config.remove();
                                                                }
                                                            })
                                                            res.status(200).json({
                                                                error: "Company Owner Deleted"
                                                            });
                                                        }
                                                    })
                                                }
                                            })
                                            .catch(err => {
                                                res.status(500).json({
                                                    error: err
                                                });
                                            });
                                    }
                                }
                                )
                                .catch(err => {
                                    res.status(500).json({
                                        error: err
                                    });
                                });
                        }
                    });
                } else {
                    co.remove(function (err) {
                        if (err) {
                            res.status(500).json({
                                error: err
                            });
                        } else {
                            Config.find({ user: co._id }, function (err, config) {
                                if (config) {
                                    config.remove();
                                }
                            })
                            res.status(200).json({
                                error: "Company Owner Deleted"
                            });
                        }
                    })
                }
            });
        } else {
            res.status(404).json({
                error: "Company Owner Not Found"
            });
        }
    });
};