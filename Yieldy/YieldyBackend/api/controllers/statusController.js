const Status = require('../models/statusModel');
const Device = require('../models/deviceModel');
const User = require('../models/userModel');
const Co = require('../models/coModel');
const mongoose = require("mongoose");
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })
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

exports.getAuditLogDefault = (req, res, next) => {

    const id = req.userData.userId;
    //If requested user is an owner, then their is no permission problems, we can return the information without problems
    if (req.userData.role === 'co') {
        Co.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    client.search({
                                        index: 'audit*',
                                        body: {
                                            size: req.params.size ? req.params.size : 1000,
                                            sort: [
                                                { "@timestamp": { "order": "desc" } },
                                                "_score"
                                            ],
                                            query: {
                                                bool: {
                                                    must: [
                                                        {
                                                            range: {
                                                                "@timestamp": {
                                                                    "gte": req.params.period ? "now-" + req.params.period + "d" : "now-365d/d",
                                                                    "lt": "now"
                                                                }
                                                            }
                                                        },
                                                        {
                                                            match: {
                                                                "fields.project": 'yieldy'
                                                            },
                                                        },
                                                        {
                                                            match: {
                                                                "fields.statuscode": req.params.statusCode
                                                            }
                                                        },
                                                    ]
                                                }
                                            }
                                        }
                                    }, (err, result) => {
                                        if (err) return res.status(500).json(err);
                                        else if (!!result && !!result.body) return res.status(200).json(result.body.hits.hits);
                                        else return res.status(404).json({
                                            error: "Device Not Found"
                                        });
                                    })
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
        //A normal user should only be able to view the device that is created at his/her system
        User.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    client.search({
                                        index: 'audit*',
                                        body: {
                                            size: req.params.size ? req.params.size : 1000,
                                            sort: [
                                                { "@timestamp": { "order": "desc" } },
                                                "_score"
                                            ],
                                            query: {
                                                bool: {
                                                    must: [
                                                        {
                                                            range: {
                                                                "@timestamp": {
                                                                    "gte": req.params.period ? "now-" + req.params.period + "d" : "now-365d/d",
                                                                    "lt": "now"
                                                                }
                                                            }
                                                        },
                                                        {
                                                            match: {
                                                                "fields.project": 'yieldy'
                                                            },
                                                        },
                                                        {
                                                            match: {
                                                                "fields.statuscode": req.params.statusCode
                                                            }
                                                        },
                                                    ]
                                                }
                                            }
                                        }
                                    }, (err, result) => {
                                        if (err) return res.status(500).json(err);
                                        else if (!!result && !!result.body) return res.status(200).json(result.body.hits.hits);
                                        else return res.status(404).json({
                                            error: "Device Not Found"
                                        });
                                    })
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
    }
}

exports.getFileLogDefault = (req, res, next) => {

    const id = req.userData.userId;
    //If requested user is an owner, then their is no permission problems, we can return the information without problems
    if (req.userData.role === 'co') {
        Co.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    client.search({
                                        index: 'filebeat*',
                                        body: {
                                            sort: [
                                                { "@timestamp": { "order": "desc" } },
                                                "_score"
                                            ],
                                            query: {
                                                bool: {
                                                    must: [
                                                        {
                                                            range: {
                                                                "@timestamp": {
                                                                    "gte": req.params.period ? "now-" + req.params.period + "d" : "now-365d/d",
                                                                    "lt": "now"
                                                                }
                                                            }
                                                        },
                                                        {
                                                            match: {
                                                                "fields.project": 'yieldy'
                                                            },
                                                        },
                                                        {
                                                            match: {
                                                                "fields.statuscode": req.params.statusCode
                                                            }
                                                        },
                                                    ]
                                                }
                                            }
                                        }
                                    }, (err, result) => {
                                        if (err) return res.status(500).json(err);
                                        else if (!!result && !!result.body) return res.status(200).json(result.body.hits.hits.length);
                                        else return res.status(404).json({
                                            error: "Device Not Found"
                                        });
                                    })
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
        //A normal user should only be able to view the device that is created at his/her system
        User.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    client.search({
                                        index: 'filebeat*',
                                        body: {
                                            sort: [
                                                { "@timestamp": { "order": "desc" } },
                                                "_score"
                                            ],
                                            query: {
                                                bool: {
                                                    must: [
                                                        {
                                                            range: {
                                                                "@timestamp": {
                                                                    "gte": req.params.period ? "now-" + req.params.period + "d" : "now-365d/d",
                                                                    "lt": "now"
                                                                }
                                                            }
                                                        },
                                                        {
                                                            match: {
                                                                "fields.project": 'yieldy'
                                                            },
                                                        },
                                                        {
                                                            match: {
                                                                "fields.statuscode": req.params.statusCode
                                                            }
                                                        },
                                                    ]
                                                }
                                            }
                                        }
                                    }, (err, result) => {
                                        if (err) return res.status(500).json(err);
                                        else if (!!result && !!result.body) return res.status(200).json(result.body.hits.hits.length);
                                        else return res.status(404).json({
                                            error: "Device Not Found"
                                        });
                                    })
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
    }
}

exports.getHeartLogDefault = (req, res, next) => {

    const id = req.userData.userId;
    //If requested user is an owner, then their is no permission problems, we can return the information without problems
    if (req.userData.role === 'co') {
        Co.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    client.search({
                                        index: 'heartbeat*',
                                        body: {
                                            sort: [
                                                { "@timestamp": { "order": "desc" } },
                                                "_score"
                                            ],
                                            query: {
                                                bool: {
                                                    must: [
                                                        {
                                                            range: {
                                                                "@timestamp": {
                                                                    "gte": req.params.period ? "now-" + req.params.period + "d" : "now-365d/d",
                                                                    "lt": "now"
                                                                }
                                                            }
                                                        },
                                                        {
                                                            match: {
                                                                "fields.project": 'yieldy'
                                                            },
                                                        },
                                                        {
                                                            match: {
                                                                "fields.statuscode": req.params.statusCode
                                                            }
                                                        },
                                                    ]
                                                }
                                            }
                                        }
                                    }, (err, result) => {
                                        if (err) return res.status(500).json(err);
                                        else if (!!result && !!result.body) return res.status(200).json(result.body.hits.hits);
                                        else return res.status(404).json({
                                            error: "Device Not Found"
                                        });
                                    })
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
        //A normal user should only be able to view the device that is created at his/her system
        User.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    client.search({
                                        index: 'heartbeat*',
                                        body: {
                                            sort: [
                                                { "@timestamp": { "order": "desc" } },
                                                "_score"
                                            ],
                                            query: {
                                                bool: {
                                                    must: [
                                                        {
                                                            range: {
                                                                "@timestamp": {
                                                                    "gte": req.params.period ? "now-" + req.params.period + "d" : "now-365d/d",
                                                                    "lt": "now"
                                                                }
                                                            }
                                                        },
                                                        {
                                                            match: {
                                                                "fields.project": 'yieldy'
                                                            },
                                                        },
                                                        {
                                                            match: {
                                                                "fields.statuscode": req.params.statusCode
                                                            }
                                                        },
                                                    ]
                                                }
                                            }
                                        }
                                    }, (err, result) => {
                                        if (err) return res.status(500).json(err);
                                        else if (!!result && !!result.body) return res.status(200).json(result.body.hits.hits);
                                        else return res.status(404).json({
                                            error: "Device Not Found"
                                        });
                                    })
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
    }
}
exports.getPacketLogDefault = (req, res, next) => {

    const id = req.userData.userId;
    //If requested user is an owner, then their is no permission problems, we can return the information without problems
    if (req.userData.role === 'co') {
        Co.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    client.search({
                                        index: 'packet*',
                                        body: {
                                            sort: [
                                                { "@timestamp": { "order": "desc" } },
                                                "_score"
                                            ],
                                            query: {
                                                bool: {
                                                    must: [
                                                        {
                                                            range: {
                                                                "@timestamp": {
                                                                    "gte": req.params.period ? "now-" + req.params.period + "d" : "now-365d/d",
                                                                    "lt": "now"
                                                                }
                                                            }
                                                        },
                                                        {
                                                            match: {
                                                                "fields.project": 'yieldy'
                                                            },
                                                        },
                                                        {
                                                            match: {
                                                                "fields.statuscode": req.params.statusCode
                                                            }
                                                        },
                                                    ]
                                                }
                                            }
                                        }
                                    }, (err, result) => {
                                        if (err) return res.status(500).json(err);
                                        else if (!!result && !!result.body) return res.status(200).json(result.body.hits.hits.length);
                                        else return res.status(404).json({
                                            error: "Device Not Found"
                                        });
                                    })
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
        //A normal user should only be able to view the device that is created at his/her system
        User.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    client.search({
                                        index: 'packet*',
                                        body: {
                                            sort: [
                                                { "@timestamp": { "order": "desc" } },
                                                "_score"
                                            ],
                                            query: {
                                                bool: {
                                                    must: [
                                                        {
                                                            range: {
                                                                "@timestamp": {
                                                                    "gte": req.params.period ? "now-" + req.params.period + "d" : "now-365d/d",
                                                                    "lt": "now"
                                                                }
                                                            }
                                                        },
                                                        {
                                                            match: {
                                                                "fields.project": 'yieldy'
                                                            },
                                                        },
                                                        {
                                                            match: {
                                                                "fields.statuscode": req.params.statusCode
                                                            }
                                                        },
                                                    ]
                                                }
                                            }
                                        }
                                    }, (err, result) => {
                                        if (err) return res.status(500).json(err);
                                        else if (!!result && !!result.body) return res.status(200).json(result.body.hits.hits.length);
                                        else return res.status(404).json({
                                            error: "Device Not Found"
                                        });
                                    })
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
    }
}

exports.getMetricLogDefault = (req, res, next) => {

    const id = req.userData.userId;
    //If requested user is an owner, then their is no permission problems, we can return the information without problems
    if (req.userData.role === 'co') {
        Co.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    client.search({
                                        index: 'metric*',
                                        body: {
                                            size: req.params.size ? req.params.size : 1000,
                                            sort: [
                                                { "@timestamp": { "order": "desc" } },
                                                "_score"
                                            ],
                                            query: {
                                                bool: {
                                                    must: [
                                                        {
                                                            range: {
                                                                "@timestamp": {
                                                                    "gte": req.params.period ? "now-" + req.params.period + "d" : "now-365d/d",
                                                                    "lt": "now"
                                                                }
                                                            }
                                                        },
                                                        {
                                                            match: {
                                                                "fields.project": 'yieldy'
                                                            },
                                                        },
                                                        {
                                                            match: {
                                                                "fields.statuscode": req.params.statusCode
                                                            }
                                                        },
                                                    ]
                                                }
                                            }
                                        }
                                    }, (err, result) => {
                                        if (err) return res.status(500).json(err);
                                        else if (!!result && !!result.body) return res.status(200).json(result.body.hits.hits);
                                        else return res.status(404).json({
                                            error: "Device Not Found"
                                        });
                                    })
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
        //A normal user should only be able to view the device that is created at his/her system
        User.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    client.search({
                                        index: 'metric*',
                                        body: {
                                            size: req.params.size ? req.params.size : 1000,
                                            sort: [
                                                { "@timestamp": { "order": "desc" } },
                                                "_score"
                                            ],
                                            query: {
                                                bool: {
                                                    must: [
                                                        {
                                                            range: {
                                                                "@timestamp": {
                                                                    "gte": req.params.period ? "now-" + req.params.period + "d" : "now-365d/d",
                                                                    "lt": "now"
                                                                }
                                                            }
                                                        },
                                                        {
                                                            match: {
                                                                "fields.project": 'yieldy'
                                                            },
                                                        },
                                                        {
                                                            match: {
                                                                "fields.statuscode": req.params.statusCode
                                                            }
                                                        },
                                                    ]
                                                }
                                            }
                                        }
                                    }, (err, result) => {
                                        if (err) return res.status(500).json(err);
                                        else if (!!result && !!result.body) return res.status(200).json(result.body.hits.hits);
                                        else return res.status(404).json({
                                            error: "Device Not Found"
                                        });
                                    })
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
    }
}
exports.getWinLogDefault = (req, res, next) => {

    const id = req.userData.userId;
    //If requested user is an owner, then their is no permission problems, we can return the information without problems
    if (req.userData.role === 'co') {
        Co.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    client.search({
                                        index: 'winlog*',
                                        body: {
                                            sort: [
                                                { "@timestamp": { "order": "desc" } },
                                                "_score"
                                            ],
                                            query: {
                                                bool: {
                                                    must: [
                                                        {
                                                            range: {
                                                                "@timestamp": {
                                                                    "gte": req.params.period ? "now-" + req.params.period + "d" : "now-365d/d",
                                                                    "lt": "now"
                                                                }
                                                            }
                                                        },
                                                        {
                                                            match: {
                                                                "fields.project": 'yieldy'
                                                            },
                                                        },
                                                        {
                                                            match: {
                                                                "fields.statuscode": req.params.statusCode
                                                            }
                                                        },
                                                    ]
                                                }
                                            }
                                        }
                                    }, (err, result) => {
                                        if (err) return res.status(500).json(err);
                                        else if (!!result && !!result.body) return res.status(200).json(result.body.hits.hits.length);
                                        else return res.status(404).json({
                                            error: "Device Not Found"
                                        });
                                    })
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
        //A normal user should only be able to view the device that is created at his/her system
        User.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    client.search({
                                        index: 'winlog*',
                                        body: {
                                            sort: [
                                                { "@timestamp": { "order": "desc" } },
                                                "_score"
                                            ],
                                            query: {
                                                bool: {
                                                    must: [
                                                        {
                                                            range: {
                                                                "@timestamp": {
                                                                    "gte": req.params.period ? "now-" + req.params.period + "d" : "now-365d/d",
                                                                    "lt": "now"
                                                                }
                                                            }
                                                        },
                                                        {
                                                            match: {
                                                                "fields.project": 'yieldy'
                                                            },
                                                        },
                                                        {
                                                            match: {
                                                                "fields.statuscode": req.params.statusCode
                                                            }
                                                        },
                                                    ]
                                                }
                                            }
                                        }
                                    }, (err, result) => {
                                        if (err) return res.status(500).json(err);
                                        else if (!!result && !!result.body) return res.status(200).json(result.body.hits.hits.length);
                                        else return res.status(404).json({
                                            error: "Device Not Found"
                                        });
                                    })
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
    }
}
//returns last 10 status related to the device (by the satusCode)
exports.getByStatusDefault = (req, res, next) => {
    const id = req.userData.userId;
    //If requested user is an owner, then their is no permission problems, we can return the information without problems
    if (req.userData.role === 'co') {
        Co.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    Status.find({ statusCode: req.params.statusCode })
                                        .sort('-dataAdded')
                                        .limit(10)
                                        .exec()
                                        .then(docs => {
                                            if (docs) {
                                                res.status(200).json(docs);
                                            } else {
                                                res.status(404).json({
                                                    error: "Device Not Found"
                                                });
                                            }
                                        })
                                        .catch(err => {
                                            res.status(500).json({
                                                error: err.message
                                            });
                                        });
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
        //A normal user should only be able to view the device that is created at his/her system
        User.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    Status.find({ statusCode: req.params.statusCode })
                                        .sort('-dataAdded')
                                        .limit(10)
                                        .exec()
                                        .then(docs => {
                                            if (docs) {
                                                res.status(200).json(docs);
                                            } else {
                                                res.status(404).json({
                                                    error: "Device Not Found"
                                                });
                                            }
                                        })
                                        .catch(err => {
                                            res.status(500).json({
                                                error: err.message
                                            });
                                        });
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
    }
}

//Create a status, this function is called from the status scripts to update the device info and status
exports.create = (req, res, next) => {
    //When updating the status, we should update also the last updated date of the device 
    Device.findOneAndUpdate({ statusCode: req.body.statuscode }, {
        $set:
            { "lastUpdated": new Date() }
    })
        .populate('system')
        .exec()
        .then(doc => {
            if (doc) {
                //Then we create and save the status 
                const status = new Status({
                    _id: mongoose.Types.ObjectId(),
                    arch: req.body.arch,
                    cores: req.body.cores,
                    cpuusage: req.body.cpuusage,
                    memusage: req.body.memusage,
                    platform: req.body.platform,
                    release: req.body.release,
                    uptime: req.body.uptime,
                    statusCode: req.body.statuscode,
                    openedPort: req.body.openedPort,
                    dataAdded: new Date(),
                });
                status.save()
                    .then(result => {
                        res.status(201).json({
                            message: "status added"
                        });
                    }
                    )
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });
            } else {
                res.status(404).json({
                    error: "StatusCode Not Found"
                });
            }
        })

}


exports.getOneDay = (req, res, next) => {
    const id = req.userData.userId;
    //If requested user is an owner, then their is no permission problems, we can return the information without problems
    if (req.userData.role === 'co') {
        Co.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    Status.find({
                                        statusCode: req.params.statusCode,
                                        dataAdded: {
                                            $gte: new Date((new Date().getTime() - (24 * 60 * 60 * 1000)))
                                        }
                                    })
                                        .sort('-dataAdded')
                                        .limit(10)
                                        .exec()
                                        .then(docs => {
                                            if (docs) {
                                                res.status(200).json(docs);
                                            } else {
                                                res.status(404).json({
                                                    error: "Device Not Found"
                                                });
                                            }
                                        })
                                        .catch(err => {
                                            res.status(500).json({
                                                error: err.message
                                            });
                                        });
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
        //A normal user should only be able to view the device that is created at his/her system
        User.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    Status.find({
                                        statusCode: req.params.statusCode,
                                        dataAdded: {
                                            $gte: new Date((new Date().getTime() - (24 * 60 * 60 * 1000)))
                                        }
                                    })
                                        .sort('-dataAdded')
                                        .limit(10)
                                        .exec()
                                        .then(docs => {
                                            if (docs) {
                                                res.status(200).json(docs);
                                            } else {
                                                res.status(404).json({
                                                    error: "Device Not Found"
                                                });
                                            }
                                        })
                                        .catch(err => {
                                            res.status(500).json({
                                                error: err.message
                                            });
                                        });
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
    }
}
exports.getOneWeek = (req, res, next) => {
    const id = req.userData.userId;
    //If requested user is an owner, then their is no permission problems, we can return the information without problems
    if (req.userData.role === 'co') {
        Co.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    Status.find({
                                        statusCode: req.params.statusCode,
                                        dataAdded: {
                                            $gte: new Date((new Date().getTime() - (7 * 24 * 60 * 60 * 1000)))
                                        }
                                    })
                                        .sort('-dataAdded')
                                        .limit(10)
                                        .exec()
                                        .then(docs => {
                                            if (docs) {
                                                res.status(200).json(docs);
                                            } else {
                                                res.status(404).json({
                                                    error: "Device Not Found"
                                                });
                                            }
                                        })
                                        .catch(err => {
                                            res.status(500).json({
                                                error: err.message
                                            });
                                        });
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
        //A normal user should only be able to view the device that is created at his/her system
        User.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    Status.find({
                                        statusCode: req.params.statusCode,
                                        dataAdded: {
                                            $gte: new Date((new Date().getTime() - (7 * 24 * 60 * 60 * 1000)))
                                        }
                                    })
                                        .sort('-dataAdded')
                                        .limit(10)
                                        .exec()
                                        .then(docs => {
                                            if (docs) {
                                                res.status(200).json(docs);
                                            } else {
                                                res.status(404).json({
                                                    error: "Device Not Found"
                                                });
                                            }
                                        })
                                        .catch(err => {
                                            res.status(500).json({
                                                error: err.message
                                            });
                                        });
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
    }
}
exports.getOneMonth = (req, res, next) => {
    const id = req.userData.userId;
    //If requested user is an owner, then their is no permission problems, we can return the information without problems
    if (req.userData.role === 'co') {
        Co.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    Status.find({
                                        statusCode: req.params.statusCode,
                                        dataAdded: {
                                            $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
                                        }
                                    })
                                        .sort('-dataAdded')
                                        .limit(10)
                                        .exec()
                                        .then(docs => {
                                            if (docs) {
                                                res.status(200).json(docs);
                                            } else {
                                                res.status(404).json({
                                                    error: "Device Not Found"
                                                });
                                            }
                                        })
                                        .catch(err => {
                                            res.status(500).json({
                                                error: err.message
                                            });
                                        });
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
        //A normal user should only be able to view the device that is created at his/her system
        User.findById(id)
            .exec()
            .then(doc => {
                if (doc) {
                    Device.findOne({ statusCode: req.params.statusCode })
                        .populate('system')
                        .exec()
                        .then(device => {
                            if (device) {
                                if (doc.company.includes(device.system.company)) {
                                    Status.find({
                                        statusCode: req.params.statusCode,
                                        dataAdded: {
                                            $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
                                        }
                                    })
                                        .sort('-dataAdded')
                                        .limit(10)
                                        .exec()
                                        .then(docs => {
                                            if (docs) {
                                                res.status(200).json(docs);
                                            } else {
                                                res.status(404).json({
                                                    error: "Device Not Found"
                                                });
                                            }
                                        })
                                        .catch(err => {
                                            res.status(500).json({
                                                error: err.message
                                            });
                                        });
                                } else {
                                    res.status(404).json({
                                        error: "Device Not Found"
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err.message
                            });
                        })
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
    }
}

// exports.getFileLog = (req, res, next) => {
//     const result = await client.search({
//         index: 'audit*',
//         body: {
//             query: {
//                 match: { statusCode: '123123' }
//             }
//         }
//     })

//     // callback API
//     client.search({
//         index: 'audit*',
//         body: {
//             query: {
//                 match: { statusCode: '123123' }
//             }
//         }
//     }, (err, result) => {
//         if (err) console.log(err)
//     })
// }
// exports.getWinLog = (req, res, next) => {
//     const result = await client.search({
//         index: 'audit*',
//         body: {
//             query: {
//                 match: { statusCode: '123123' }
//             }
//         }
//     })

//     // callback API
//     client.search({
//         index: 'audit*',
//         body: {
//             query: {
//                 match: { statusCode: '123123' }
//             }
//         }
//     }, (err, result) => {
//         if (err) console.log(err)
//     })
// }
// exports.getPacketLog = (req, res, next) => {
//     const result = await client.search({
//         index: 'audit*',
//         body: {
//             query: {
//                 match: { statusCode: '123123' }
//             }
//         }
//     })

//     // callback API
//     client.search({
//         index: 'audit*',
//         body: {
//             query: {
//                 match: { statusCode: '123123' }
//             }
//         }
//     }, (err, result) => {
//         if (err) console.log(err)
//     })
// }
// exports.getHeartLog = (req, res, next) => {
//     const result = await client.search({
//         index: 'audit*',
//         body: {
//             query: {
//                 match: { statusCode: '123123' }
//             }
//         }
//     })

//     // callback API
//     client.search({
//         index: 'audit*',
//         body: {
//             query: {
//                 match: { statusCode: '123123' }
//             }
//         }
//     }, (err, result) => {
//         if (err) console.log(err)
//     })
// }