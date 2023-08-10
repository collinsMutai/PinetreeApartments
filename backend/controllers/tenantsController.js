const fs = require("fs");
const path = require("path");

const Tenant = require("../model/tenantsSchema");


const PDFDocument = require("pdfkit");

exports.getTenants = async (req, res, next) => {

  const tenants = await Tenant.find().sort({apt: 'asc'});
  try {
    
    res.render("tenants", {
      path: "/tenants",
      tenants: tenants,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getInvoice = (req, res, next) => {
  const tenantId = req.params.tenantId;

  Tenant.findById({ _id: tenantId })
    .then((user) => {
      return { apt: user.apt, tenant: user.name };
    })
    .then((result) => {
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
        'attachment; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
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
    });
};
