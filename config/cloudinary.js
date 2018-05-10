const cloudinary = require('cloudinary').v2;
const cloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.cloudName,
    api_key: process.env.apiKey,
    api_secret: process.env.apiSecret
});

var storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'folder-name',
  allowedFormats: ['jpg', 'png', 'wav', 'mp3', 'aif', 'mov', 'mp4', 'avi'],
  filename: function (req, file, cb) {
    cb(null, 'my-file-name');
  }
});

const uploadCloud = multer({ storage: storage });
module.exports = uploadCloud;