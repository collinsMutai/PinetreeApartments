const express = require("express");
const router = express.Router();

const tenantsController = require("../controllers/tenantsController");

router.get("/", tenantsController.getHome);

router.get("/tenants", tenantsController.getTenants);

router.get("/tenants/:tenantId", tenantsController.getInvoice);

module.exports = router;
