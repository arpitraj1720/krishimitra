const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* ===========================
   REGISTER USER
=========================== */

const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    });

    if (existingUser) {
      if (phone && existingUser.phone === phone) {
        return res.status(400).json({
          message: "Phone number already registered. Please login instead.",
        });
      }

      if (email && existingUser.email === email) {
        return res.status(400).json({
          message: "Email already registered. Please login instead.",
        });
      }

      return res.status(400).json({
        message: "User already exists. Please login instead.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email: email || undefined,
      phone: phone || undefined,
      password: hashedPassword,
    });

    return res.status(201).json({
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

    // Handle Mongo duplicate key errors
    if (error.code === 11000) {
      if (error.keyPattern?.phone) {
        return res.status(400).json({
          message: "Phone number already registered",
        });
      }

      if (error.keyPattern?.email) {
        return res.status(400).json({
          message: "Email already registered",
        });
      }

      return res.status(400).json({
        message: "User already exists",
      });
    }

    return res.status(500).json({
      message: "Server error",
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

    return res.status(200).json({
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

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};