const express = require("express");
const { check, body } = require("express-validator");
const Tenant = require("../model/tenantsSchema");
const router = express.Router();

const isAuth = require("../middleware/is-auth");

const tenantsController = require("../controllers/tenantsController");

router.post(
  "/tenants",
  isAuth,
  [
    check("apt").custom((value, { req }) => {
      return Tenant.findOne({ apt: value, landlordId: req.landlord._id }).then(
        (userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Apt# already assigned, please add another one."
            );
          }
        }
      );
    }),
  ],
  tenantsController.createTenant
);

router.get("/tenants", isAuth, tenantsController.getTenants);

router.get("/tenants/:tenantId", isAuth, tenantsController.getInvoice);

// router.post(
//   "/tenants/water",
//   [
//     body("apt", "Apt# is required").not().isEmpty(),
//     body("amount", "Amount is required").not().isEmpty(),
//   ],
//   tenantsController.getWaterInvoice
// );
router.post("/tenants/water", tenantsController.getWaterInvoice);

router.post("/tenants/:tenantId", isAuth, tenantsController.deleteTenant);

router.get("/tenants/edit/:tenantId", isAuth, tenantsController.getEditTenant);

router.post(
  "/tenants/edit/:tenantId",
  isAuth,
  [
    check("apt").custom((value, { req }) => {
      return Tenant.findOne({ apt: value, landlordId: req.landlord._id }).then(
        (userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Apt# already assigned, please add another one."
            );
          }
        }
      );
    }),
  ],
  tenantsController.postEditTenant
);

module.exports = router;
