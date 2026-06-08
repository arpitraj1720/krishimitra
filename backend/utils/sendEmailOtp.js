const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmailOtp = async (email, otp) => {
  try {
    console.log("Sending email to:", email);

    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
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

    console.log("EMAIL SENT:", data);
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    throw err;
  }
};

module.exports = sendEmailOtp;