const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const OtpVerification = require("../models/OtpVerification");

/* ===========================
   REGISTER USER
=========================== */
const sendOtp = async (req, res) => {
  console.log("SEND OTP ROUTE HIT");
  try {
    const { identifier, type } = req.body;

    if (!identifier || !type) {
      return res.status(400).json({
        message: "Identifier and type are required",
      });
    }
const existingUser = await User.findOne({
  $or: [
    ...(type === "email"
      ? [{ email: identifier }]
      : []),

    ...(type === "phone"
      ? [{ phone: identifier }]
      : []),
  ],
});

if (existingUser) {
  return res.status(400).json({
    message: "User already exists. Please login.",
  });
}
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await OtpVerification.findOneAndUpdate(
      { identifier },
      {
        identifier,
        type,
        otp,
        expiresAt,
      },
      {
        upsert: true,
        new: true,
      }
    );

    console.log(
      `OTP for ${identifier}: ${otp}`
    );

    res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const verifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    const record = await OtpVerification.findOne({
      identifier,
    });

    if (!record) {
      return res.status(400).json({
        message: "OTP not found",
      });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (record.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    await OtpVerification.deleteOne({
      _id: record._id,
    });

    res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    const existingUser = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/* ===========================
   LOGIN USER
=========================== */
const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier },
      ],
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  registerUser,
  loginUser,
};