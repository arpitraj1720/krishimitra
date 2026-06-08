const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const sendEmailOtp = async (email, otp) => {
  try {
    console.log("Sending email to:", email);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "KrishiMitra OTP Verification",
      html: `
        <h2>KrishiMitra</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
      `,
    });

    console.log("EMAIL SENT:", info.messageId);

  } catch (err) {
    console.error("EMAIL ERROR:", err);
    throw err;
  }
};

module.exports = sendEmailOtp;