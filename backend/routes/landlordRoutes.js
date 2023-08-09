const express = require("express");

const router = express.Router();

const landlordController = require("../controllers/landlordController");

router.get("/login", landlordController.getLogin);

router.post("/login", landlordController.postLogin);

module.exports = router;
