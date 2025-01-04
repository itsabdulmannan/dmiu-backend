const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadPath = path.resolve(__dirname, '../../public/images');

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const acceptedFileTypes = ['image/jpeg', 'image/png'];
        if (acceptedFileTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type'), false);
        }
    }
});

module.exports = upload;
