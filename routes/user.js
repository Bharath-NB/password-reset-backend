import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";  // Import User model

const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.json({ message: "user already existed" });
  }

  const hashpassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashpassword,
  });

  await newUser.save();
  return res.json({ status: true, message: "User registered" });
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "user is not registered" });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.json({ message: "password is incorrect" });
  }

  const token = jwt.sign({ username: user.username, id: user._id }, process.env.KEY, {
    expiresIn: "1h",
  });
  res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });  // Set cookie with token
  return res.json({ status: true, message: "login successful" });
});

// Forgot password route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "user not registered" });
    }
    const token = jwt.sign({ id: user._id }, process.env.KEY, {
      expiresIn: "1d",
    });

    var transporter = nodemailer.createTransport({
      port: 465,
      service: "gmail",
      auth: {
        user: "bharath.s8499@gmail.com",  
        pass: "lelunsmonlvzjkko",  
      },
    });

    const encodedToken = encodeURIComponent(token).replace(/\./g, "%2E");
    var mailOptions = {
      from: "bharath.s8499@gmail.com",  
      to: email,
      subject: "Reset Password",
      text: `Click the link to reset your password: https://yourdomain.com/resetPassword/${encodedToken}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.json({ message: "error sending email" });
      } else {
        return res.json({ status: true, message: "email sent" });
      }
    });
  } catch (err) {
    console.log(err);
  }
});

// Reset password route
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.KEY);
    const id = decoded.id;
    const hashPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(id, { password: hashPassword });
    return res.json({ status: true, message: "updated password" });
  } catch (err) {
    return res.json({ message: "invalid token" });
  }
});

// Middleware to verify the user (protected route)
const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({ status: false, message: "no token" });
    }
    const decoded = jwt.verify(token, process.env.KEY);
    req.user = decoded;  // Attach user info to request
    next();
  } catch (err) {
    return res.json({ status: false, message: "invalid token" });
  }
};

// Protected route
router.get("/verify", verifyUser, (req, res) => {
  return res.json({ status: true, message: "authorized" });
});

// Logout route
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ status: true });
});

export { router as UserRouter };
