import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
                    cb(null, '../public/temp');
                },
    filename: function (req, file, cb) {
                    cb(null, file.originalname);
                }
});

export const upload = multer({ storage });
// upload is an instance of multer()

// this helps in storing images locally