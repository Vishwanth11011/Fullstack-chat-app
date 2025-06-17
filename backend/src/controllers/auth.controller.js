import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
// import { OtpVerification } from "../models/OtpVerification.js";
// import { sendEmail } from '../utils/emailSender.js';

import Otp from "../models/Otp.js";
// import { sendVerificationEmail } from "../utils/sendOTP.js";
import { sendOtpEmail } from "../utils/sendMail.js";
import jwt from "jsonwebtoken";

export const initiateSignup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });
    // await sendVerificationEmail(email, otp);
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
};

export const verifyOtpAndSignup = async (req, res) => {
  const { fullName, email, password, otp } = req.body;

  try {
    // Validate required fields
    if (!fullName || !email || !password || !otp) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find OTP entry
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check OTP expiration (10 min expiry)
    const otpExpiry = 10 * 60 * 1000;
    if (Date.now() - new Date(validOtp.createdAt).getTime() > otpExpiry) {
      await Otp.deleteMany({ email });
      return res.status(400).json({ message: "OTP expired. Please try again." });
    }

    // Check if user already exists
    // const existingUser = await User.findOne({ email });
    // if (existingUser) {
    //   return res.status(400).json({ message: "User already exists" });
    // }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    // Create JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Clean up OTP
    await Otp.deleteMany({ email });

    return res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Signup failed. Please try again." });
  }
};


export const signup = async (req,res)=>{
    const {fullName,email,password} = req.body
    try {
        if(!fullName || !email || !password){
            return res.status(400).json({ message:"All fields are required"});
        }
        if(password.length < 8){
            return res.status(400).json({ message:"Password must be atleast 8 characters"});
        }

        const user = await User.findOne({email})

        if(user) return req.status(400).json({ message: "Email already exists"});

        //hasing
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser = new User({
            fullName : fullName,
            email : email,
            password : hashedPassword,
            createdAt: newUser.createdAt, 
        })

        if(newUser){
            //jwt token
            generateToken(newUser._id,res);
            await newUser.save();

            res.status(200).json({
                _id :newUser._id,
                fullName : newUser.fullName,
                email : newUser.email,
                profilePic : newUser.profilePic,
            });

        }else{
            res.status(400).json({message:"Invalid user data"});
        }

    } catch (error) {
        console.log("error in signup controller ")
        res.status(400).json({message:"Internal server error"});
    }
};

// export const initiateSignup = async (req, res) => {
//     console.log("InitiateSignup called")
//     const { fullName, email, password } = req.body;
//     console.log(fullName,email,password);
//     try {
//         if (!fullName || !email || !password) {
//             return res.status(400).json({ message: "All fields are required" });
//         }

//         const user = await User.findOne({ email });
//         if (user) return res.status(400).json({ message: "Email already exists" });

//         // Hash password
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         // Generate OTP
//         const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

//         // Save OTP verification entry
//         await OtpVerification.create({
//             email,
//             fullName,
//             password: hashedPassword,
//             otp,
//         });

//         // Send OTP via email
//         // const transporter = nodemailer.createTransport({
//         //     service: "gmail",
//         //     auth: {
//         //         user: process.env.EMAIL_USER, // your email
//         //         pass: process.env.EMAIL_PASS, // your email app password
//         //     },
//         // });

//         // await transporter.sendMail({
//         //     from: process.env.EMAIL_USER,
//         //     to: email,
//         //     subject: "Your OTP for Signup",
//         //     text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
//         // });

//         await sendEmail({
//             to: email,
//             subject: 'Your OTP Code',
//             text: `Hello ${fullName}, your OTP code is: ${otp}`
//         });


//         res.status(200).json({ message: "OTP sent to email" });

//     } catch (error) {
//         console.log("Error in initiateSignup", error.message);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

// export const verifyOtp = async (req, res) => {
//     const { email, otp } = req.body;

//     try {
//         const otpEntry = await OtpVerification.findOne({ email, otp });

//         if (!otpEntry) {
//             return res.status(400).json({ message: "Invalid or expired OTP" });
//         }

//         // Create user now
//         const newUser = new User({
//             fullName: otpEntry.fullName,
//             email: otpEntry.email,
//             password: otpEntry.password,
//         });

//         await newUser.save();

//         // Cleanup OTP entry
//         await OtpVerification.deleteOne({ email });

//         // Generate JWT token
//         generateToken(newUser._id, res);

//         res.status(200).json({
//             _id: newUser._id,
//             fullName: newUser.fullName,
//             email: newUser.email,
//             profilePic: newUser.profilePic,
//         });

//     } catch (error) {
//         console.log("Error in verifyOtp", error.message);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

export const login = async (req,res)=>{
    const {email, password} = req.body
   try {
    const user = await User.findOne({email})

    if(!user) {
        return res.status(400).json({message:"Invalid Credentials"});
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!isPasswordCorrect) {
        return res.status(400).json({message:"Invalid Credentials"});
    }

    generateToken(user._id, res);
    res.status(200).json({
        _id :user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
    })
   } catch (error) {
        console.log("erorr in login controller", error.message);
        req.status(500).json({message: "Internal server error"});
   }
};

export const logout = (req,res)=>{
    try {
        res.cookie("jwt", "", {maxAge:0})
        res.status(200).json({message:"Logged out succefully"});
    } catch (error) {
        console.log("erorr in logout controller", error.message);
        res.status(500).json({message: "Internal server erorr"});
    }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    await Otp.create({ email, otp });

    // Send OTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Your App" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP for password reset is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
    });

    res.status(200).json({ message: "OTP sent" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) return res.status(400).json({ message: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    await Otp.deleteMany({ email });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if file is provided
    if (!req.files || !req.files.profilePic) {
      return res.status(400).json({ message: "Profile picture is required." });
    }

    const file = req.files.profilePic;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "profile_pics", // optional, for organization
    });

    // Update user with Cloudinary URL
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ).select("-password"); // Do not return password

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const checkAuth = (req,res) =>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller",error.message);
        res.status(500).json({message:"Internal server error"});
    }
}