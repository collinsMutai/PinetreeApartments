const Landlord = require("../model/landlordSchema");

exports.getLogin = (req, res, next) => {
  res.render("landlord/login", {
    path: "/landlord/login",
    pageTitle: "Landlord Login",
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  Landlord.findOne({ email: email }).then((user) => {
    if (!user) {
      res.redirect("/landlord/login");
    }
    console.log(user);
    res.redirect("/tenants");
  });
};
