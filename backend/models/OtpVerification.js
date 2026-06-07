const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["email", "phone"],
      required: true,
    },

    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "OtpVerification",
  otpVerificationSchema
);