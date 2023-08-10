const express = require("express");

const router = express.Router();

const landlordController = require("../controllers/landlordController");

router.get('/signup', landlordController.getSignup)

router.post('/signup', landlordController.postSignup)

router.get('/', landlordController.getLogin)

router.post("/", landlordController.postLogin);

router.post("/logout", landlordController.postLogout)

module.exports = router;
