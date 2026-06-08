const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmailOtp = async (email, otp) => {
  try {
    console.log("Sending email to:", email);



    const info = await transporter.sendMail({
      from: `"KrishiMitra" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "KrishiMitra OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>KrishiMitra OTP Verification</h2>
          <p>Your OTP is:</p>
          <h1 style="color: green;">${otp}</h1>
          <p>This OTP expires in 5 minutes.</p>
        </div>
      `,
    });

    console.log("EMAIL SENT:", info.messageId);
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    throw err;
  }
};

module.exports = sendEmailOtp;