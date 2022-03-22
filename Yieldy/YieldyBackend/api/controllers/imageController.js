const imageModel = require('../models/imageModel');
const cloud = require('../configs/cloudinaryConfig');

exports.createApp = (req, res) => {
    try {
        var imageDetails = {
            imageName: req.body.imageName,
        }
        //USING MONGO METHOD TO FINE IF IMAGE-NAME EXIST IN THE DB
        imageModel.find({ imageName: imageDetails.imageName }, (err, callback) => {
            //CHECKING IF ERROR OCCURRED      
            if (err) {
                res.json({
                    err: err,
                    message: 'there was a problem uploading image'
                })
            } else {
                var imageDetails = {
                    imageName: req.body.imageName,
                    cloudImage: req.files[0].path,
                    imageId: ''
                }
                cloud.uploads(imageDetails.cloudImage).then((result) => {
                    var imageDetails = {
                        imageName: req.body.imageName,
                        cloudImage: result.url,
                        imageId: result.id
                    }
                    //THEN CREATE THE FILE IN THE DATABASE
                    imageModel.create(imageDetails, (err, created) => {
                        if (err) {
                            res.json({
                                err: err,
                                message: 'could not upload image, try again'
                            })
                        } else {
                            res.json({
                                created: created,
                                message: "image uploaded successfully!!"
                            })
                        }
                    })
                })
            }
        });
    } catch (execptions) {
        console.log(execptions)
    }
}