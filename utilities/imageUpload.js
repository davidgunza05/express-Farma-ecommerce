const multer = require("multer");
const path = require("path");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/products");
//   },
//   filename: (req, file, cb) => {
//     const name = req.body.name + "_" + Date.now();
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `${name}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(console.log("Multer Filter: Must upload an Image"), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

module.exports = upload;
