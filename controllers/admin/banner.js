const BannerCLTN = require("../../models/admin/banner");
const sharp = require("sharp");

exports.viewAll = async (req, res) => {
  try {
    const allBanners = await BannerCLTN.find().sort({ _id: -1 });
    res.render("admin/partials/banner", {
      session: req.session.admin,
      allBanners,
      documentTitle: "Gerenciamento de Banner",
    });
  } catch (error) {
    console.log("Err ao mostrar todos banners: " + error);
    res.redirect("/admin");
  }
};

exports.addNew = async (req, res) => {
  try {
    if (req.file) {
      let bannerImage = `${req.body.title}_${Date.now()}.WebP`;
      sharp(req.file.buffer)
        .toFormat("WebP")
        .resize(500)
        .toFile(`public/img/banners/${bannerImage}`);

      req.body.image = bannerImage;
    }
    const newBanner = new BannerCLTN(req.body);
    newBanner.save();
    res.redirect("/admin/banner_management");
  } catch (error) {
    res.redirect("/admin");
    console.log("Erro ao adicionar novo banner: " + error);
  }
};

exports.changeActivity = async (req, res) => {
  try {
    let newActivity = req.body.currentActivity === "true";
    newActivity = !newActivity;
    await BannerCLTN.findByIdAndUpdate(req.body.bannerID, {
      $set: {
        active: newActivity,
      },
    });
    res.json({
      data: {
        activity: 1,
      },
    });
  } catch (error) {
    res.redirect("/admin");
    console.log("Erro ao mudar status do banner: " + error);
  }
};

exports.delete = async (req, res) => {
  try {
    await BannerCLTN.findByIdAndDelete(req.body.bannerID);
    res.json({
      data: {
        deleted: 1,
      },
    });
  } catch (error) {
    res.redirect("/admin");
    console.log("Erro ao deletar banner: " + error);
  }
};
