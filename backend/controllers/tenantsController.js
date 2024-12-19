const fs = require("fs");
const path = require("path");

const Tenant = require("../model/tenantsSchema");
const Landlord = require("../model/landlordSchema");

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
  const errors = validationResult(req);
  try {
    res.render("tenants", {
      path: "/tenants",
      tenants: tenants,
      tenant: "",
      errorMessage: req.flash("error"),
      errorMessage2: req.flash("error2"),
      validationErrors: errors.array(),
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
    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      return next(new Error("Tenant not found."));
    }

    const result = {
      apt: tenant.apt,
      tenant: tenant.name,
      landlordId: tenant.landlordId,
    };
    const landlord = await Landlord.findById(result.landlordId); // Get landlord details

    const d = new Date();
    let year = d.getFullYear().toString();
    let month = d.getMonth() + 1;
    let day = d.getDate().toString();
    let paidDate = day + month.toString() + year;

    const invoiceName = "invoice-" + paidDate + result.tenant + ".pdf";
    const invoicePath = path.join("data", "invoices", invoiceName);

    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="' + invoiceName + '"'
    );
    pdfDoc.pipe(res);

    // Header Section: Logo and Title
    pdfDoc
      .image("images/logo.png", {
        fit: [150, 150],
        align: "center",
        valign: "top",
      })
      .moveDown(1);

    pdfDoc
      .fontSize(24)
      .fillColor("#2D3E50") // Dark gray color for text
      .text("Rent Invoice", { align: "center", underline: true })
      .moveDown(1);

    // Landlord Information Section
    pdfDoc
      .fontSize(12)
      .fillColor("#333333") // Lighter gray for general text
      .text(`Landlord: ${landlord.name}`, { bold: true })
      .text(`Address: ${landlord.address}`)
      .text(`Phone: ${landlord.contact}`)
      .moveDown(1);

    // Tenant Information Section
    pdfDoc
      .fontSize(12)
      .text(`Tenant: ${result.tenant}`)
      .text(`Apt#: ${result.apt}`)
      .moveDown(1);

    // Invoice Date and Payment Info Section
    pdfDoc
      .fontSize(12)
      .text(`Invoice Date: ${d.toLocaleDateString("en-US")}`, { align: "left" })
      .moveDown(1);

    // Itemized Charges Section
    const rentAmount = 5000; // Replace with dynamic data if needed
    const waterAmount = req.body.amount || 0; // Example dynamic value for water

    const items = [
      { description: "Rent", amount: rentAmount },
      { description: "Water Charges", amount: waterAmount },
    ];

    let totalAmount = 0;
    pdfDoc
      .fontSize(14)
      .fillColor("#2D3E50")
      .text("Itemized Charges", { underline: true })
      .moveDown(0.5);

    // Table Header
    pdfDoc
      .fontSize(12)
      .fillColor("#FFFFFF")
      .rect(50, pdfDoc.y, 500, 25)
      .fill("#2D3E50")
      .stroke()
      .text("Description", 55, pdfDoc.y + 5)
      .text("Amount (Kshs)", 350, pdfDoc.y + 5)
      .moveDown(1);

    // Table Row for Itemized Charges
    items.forEach((item) => {
      totalAmount += item.amount;
      pdfDoc
        .fontSize(12)
        .fillColor("#333333")
        .text(item.description, 55, pdfDoc.y + 5)
        .text(item.amount, 350, pdfDoc.y + 5)
        .moveDown(0.8);
    });

    pdfDoc.text("---------------", { align: "center" }).moveDown(1);

    // Total Amount Paid Section
    pdfDoc
      .fontSize(14)
      .fillColor("#388E3C") // Green color for "Total Amount Paid"
      .text(`Total Amount Paid: Kshs ${totalAmount}`, { bold: true })
      .moveDown(1);

    // Due Date Section
    const dueDate = new Date(d);
    dueDate.setDate(dueDate.getDate() + 10); // Payment due in 10 days
    const dueFormatted = dueDate.toLocaleDateString("en-US");
    pdfDoc
      .fontSize(12)
      .text(`Due Date: ${dueFormatted}`, { align: "left" })
      .moveDown(1);

    // Footer Section with Contact Info
    pdfDoc
      .fontSize(11)
      .fillColor("#333333")
      .text("Thank you for your business.", { align: "center" })
      .moveDown(0.5)
      .text("For inquiries, please contact: 0797759858", { align: "center" })
      .moveDown(0.5)
      .text("Email: landlord@example.com", { align: "center" });

    pdfDoc.end();
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};


exports.getWaterInvoice = async (req, res, next) => {
  const apt = req.body.apt;
  const amount = req.body.amount;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("error2", errors.array()[0].msg);
    return res.redirect("/tenants");
  }

  try {
    const user = await Tenant.findOne({
      apt: apt,
      landlordId: req.landlord._id,
    });

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
      .text("Water invoice", {
        underline: true,
      })
      .moveDown(2);

    pdfDoc
      .fontSize(14)
      .text(`Apt#${result.apt} - Date ${formatedDate}`)
      .moveDown(0.5);

    pdfDoc
      .fontSize(13)
      .text(`Water payment amount Kshs ${amount}`)
      .moveDown(0.5);

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
    console.log(tenant);

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
      errorMessage2: req.flash("error"),
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

    if (!tenant) {
      req.flash("error", "Tenant not found.");
      return res.redirect("/tenants");
    }

    tenant.name = name;
    tenant.apt = apt;

    await tenant.save();
    res.redirect("/tenants");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
