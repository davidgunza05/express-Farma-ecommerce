const sharp = require("sharp");

exports.userProfilePic = (req, res, next) => {
  if (!req.file) {
    return next();
  }
  req.file.filename = `${req.body.name}_${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(320, 320)
    .toFormat("jpeg")
    .jpeg({ quality: 80 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
};

// exports.productImage = (req, res, next) => {
//   req.file.filename = `${req.body.name}_${Date.now()}_${req.}.jpeg`;

//   sharp(req.file.buffer)
//     .resize(320, 320)
//     .toFormat("jpeg")
//     .jpeg({ quality: 80 })
//     .toFile(`public/img/products/${req.file.filename}`);
//   next();
// };
