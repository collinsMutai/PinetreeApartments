const express = require("express");
const { check, body } = require("express-validator");
const Tenant = require("../model/tenantsSchema");
const router = express.Router();

const tenantsController = require("../controllers/tenantsController");
// [
//   check("apt").custom((value, { req }) => {
//     return Tenant.findOne({ apt: value }).then((userDoc) => {
//       if (userDoc) {
//         return Promise.reject(
//           "Apt# already assigned, please add another one."
//         );
//       }
//     });
//   }),
// ],
router.post(
  "/tenants",

  tenantsController.createTenant
);

router.get("/tenants", tenantsController.getTenants);

router.get("/tenants/:tenantId", tenantsController.getInvoice);

router.post("/tenants/:tenantId", tenantsController.deleteTenant);

router.get("/tenants/edit/:tenantId", tenantsController.getEditTenant);

router.post("/tenants/edit/:tenantId", tenantsController.postEditTenant);

module.exports = router;
