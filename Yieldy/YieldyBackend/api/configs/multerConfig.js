var multer = require('multer');
const path = require('path');
//Multer settings for image uploads
//multer.diskStorage() creates a storage space for storing files. 
var storage = multer.diskStorage({
    destination:function(req, file,cb){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            cb(null, "./")
        }else{
            cb({message: 'this file is neither a jpeg or png file'}, false)
        }
    },
    filename: function(req, file, cb){
        cb(null, new Date().toISOString() + file.originalname);
    }
});

var upload = multer({storage:storage});
module.exports = upload;