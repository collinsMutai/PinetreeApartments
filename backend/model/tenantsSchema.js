const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tenantSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  apt: {
    type: String,
    required: true,
  },
  landlordId: {
    type: Schema.Types.ObjectId,
    ref: "Landlord",
    required: true
  }
});

module.exports = mongoose.model("Tenant", tenantSchema);
