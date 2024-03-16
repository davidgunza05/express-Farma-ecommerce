const ReviewCLTN = require("../../models/user/reviews");

exports.addNew = async (req, res) => {
  req.body.customer = req.session.userID;
  await ReviewCLTN.create(req.body);
  res.json({
    succes: 1,
  });
};

exports.helpful = async (req, res) => {
  if (req.session.userID != undefined) {
    await ReviewCLTN.findByIdAndUpdate(req.body.reviewID, {
      $inc: {
        helpful: 1,
      },
    });
    res.json({
      success: 1,
    });
  } else {
    res.json({
      success: 0,
    });
  }
};
