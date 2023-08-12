const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const Landlord = require("./model/landlordSchema");

// const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const bodyParser = require("body-parser");

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
app.set("view engine", "ejs");

const tenantRoutes = require("./routes/tenantsRoutes");
const landlordRoutes = require("./routes/landlordRoutes");

const errorController = require("./controllers/error");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

// app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.static("public"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.landlord = req.session.landlord;
  
  next();
});

app.use(async (req, res, next) => {
  if (!req.session.landlord) {
    return next();
  }
  try {
    const landlord = await Landlord.findById(req.session.landlord._id);
    if (!landlord) {
      return next();
    }
    req.landlord = landlord;
    next();
  } catch (err) {
    next(new Error(err));
  }
});

app.use(tenantRoutes);
app.use(landlordRoutes);

// app.use("/500", errorController.get500);

app.use((error, req, res, next) => {
  res.render("500", {
    path: "/",
    pageTitle: "Server Error",
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log("Listening on 3000");
    });
  })
  .catch((err) => console.log(err));
