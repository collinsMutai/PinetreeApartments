const bcrypt = require("bcryptjs");
const Landlord = require("../model/landlordSchema");

exports.getSignup = (req, res, next) => {
  res.render("signup", {
    path: "/signup",
    pageTitle: "Landlord Signup",
  });
};

exports.postSignup = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  console.log(name,email,password);
  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const landlord = new Landlord({
      name: name,
      email: email,
      password: hashedPassword,
    });
    await landlord.save();
    return res.redirect("/");
  } catch (err) {
    console.log(err);
  }
};

exports.getLogin = (req, res, next) => {
  res.render("home", {
    path: "/",
    pageTitle: "Landlord Login",
  });
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const landlord = await Landlord.findOne({ email: email });
    if (!landlord) {
      res.redirect("/");
    }
  
    const doMatch = await bcrypt.compare(password, landlord.password);
    if (doMatch) {
      req.session.isLoggedIn = true;
      req.session.landlord = landlord;
      return req.session.save((err) => {
        console.log(err);
        res.redirect("/tenants");
      });
    }
    return res.redirect("/");
  } catch (err) {
    console.log(err);
  }
};

exports.postLogout = async (req, res, next) => {
  await req.session.destroy((err) => {
    console.log(err);
    res.redirect('/')
 })
}