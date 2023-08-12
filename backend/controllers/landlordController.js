const bcrypt = require("bcryptjs");
const Landlord = require("../model/landlordSchema");

const { validationResult } = require("express-validator");

exports.getSignup = (req, res, next) => {
  res.render("signup", {
    path: "/signup",
    pageTitle: "Landlord Signup",
    oldInput: {
      name: "",
      email: "",
      password: "",
    },
    validationErrors: [],
    errorMessage: "",
  });
};

exports.postSignup = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("signup", {
      path: "/signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        name: name,
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

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
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getLogin = (req, res, next) => {
  res.render("home", {
    path: "/",
    pageTitle: "Landlord Login",
    errorMessage: "",
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("home", {
      path: "/",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }
  try {
    const landlord = await Landlord.findOne({ email: email });

    if (!landlord) {
      return res.status(422).render("home", {
        path: "/",
        errorMessage: "Invalid email or password.",
        oldInput: {
          email: email,
          password: password,
        },
        validationErrors: [],
      });
    }

    const doMatch = await bcrypt.compare(password, landlord.password);
    if (doMatch) {
      req.session.isLoggedIn = true;
      req.session.landlord = landlord;
      return req.session.save((err) => {
        res.redirect("/tenants");
        // res.render("tenants", {
        //   path: "/tenants",
        //   editing: false,
        //   tenant: "",
        //   errorMessage: "",
        //   validationErrors: [],
        // });
      });
    }

    return res.status(422).render("home", {
      path: "/",
      errorMessage: "Invalid email or password.",
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postLogout = async (req, res, next) => {
  await req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
