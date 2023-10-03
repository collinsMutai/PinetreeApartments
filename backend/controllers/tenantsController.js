const fs = require("fs");
const path = require("path");

const Tenant = require("../model/tenantsSchema");

const { validationResult } = require("express-validator");

const PDFDocument = require("pdfkit");

exports.createTenant = async (req, res, next) => {
  const name = req.body.name;
  const apt = req.body.apt;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    
    req.flash("error", "Apt# already assigned, please add another one.");
    return res.redirect("/tenants");
  }

  try {
    const tenant = new Tenant({
      name: name,
      apt: apt,
      landlordId: req.landlord,
    });
    tenant.save();
    res.redirect("/tenants");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getTenants = async (req, res, next) => {
  const tenants = await Tenant.find({ landlordId: req.landlord._id }).sort({
    apt: "asc",
  });
  try {
    res.render("tenants", {
      path: "/tenants",
      tenants: tenants,
      tenant: "",
      errorMessage: req.flash('error'),
      validationErrors: [],
      editing: false,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getInvoice = async (req, res, next) => {
  const tenantId = req.params.tenantId;
  try {
    const user = await Tenant.findById({ _id: tenantId });

    const result = { apt: user.apt, tenant: user.name };

    const d = new Date();
    let year = d.getFullYear().toString();
    let month = d.getMonth() + 1;
    let day = d.getDate().toString();
    let paidDate = day + month.toString() + year;

    const invoiceName = "invoice-" + paidDate + result.tenant + ".pdf";
    const invoicePath = path.join("data", "invoices", invoiceName);

    const pdfDoc = new PDFDocument({ size: "A6" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'download; filename="' + invoiceName + '"'
    );
    // pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc
      .image("images/logo.png", {
        fit: [150, 150],
        align: "center",
        valign: "top",
      })
      .moveDown(1.5);
    const date = new Date();

    const formatedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    pdfDoc
      .fontSize(16)
      .text("Invoice", {
        underline: true,
      })
      .moveDown(2);

    pdfDoc
      .fontSize(14)
      .text(`Apt#${result.apt} - Date ${formatedDate}`)
      .moveDown(0.5);

    pdfDoc.fontSize(13).text("Rent Paid - 5000").moveDown(0.5);

    pdfDoc.text("---------------").moveDown(2);

    pdfDoc.fontSize(12).text("Thank you for your business.").moveDown(0.5);

    pdfDoc
      .fontSize(11)
      .text("Contact info - 0797759858", {
        underline: true,
      })
      .moveDown(0.5);

    pdfDoc.end();
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.deleteTenant = async (req, res, next) => {
  const tenantId = req.params.tenantId;
  try {
    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      return next(new Error("Tenant not found."));
    }
    await Tenant.deleteOne({ _id: tenantId, landlordId: req.landlord._id });
    res.redirect("/tenants");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getEditTenant = async (req, res, next) => {
  const tenantId = req.params.tenantId;

  try {
    const tenant = await Tenant.findById(tenantId);
    const tenants = await Tenant.find({ landlordId: req.landlord._id }).sort({
      apt: "asc",
    });
    if (!tenant) {
      return res.redirect("/tenants");
    }

    return res.render("tenants", {
      path: "/tenants",
      editing: true,

      tenant: tenant,
      tenants: tenants,
      
      errorMessage: req.flash("error"),
      validationErrors: [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postEditTenant = async (req, res, next) => {
  const name = req.body.name;
  const apt = req.body.apt;
  const tenantId = req.params.tenantId;

  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    req.flash("error", "Apt# already assigned, please add another one.");
    return res.redirect("/tenants");
  }

  try {
    const tenant = await Tenant.findById(tenantId);
    tenant.name = name;
    tenant.apt = apt;
    console.log(tenant);
    await tenant.save();
    res.redirect("/tenants");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
