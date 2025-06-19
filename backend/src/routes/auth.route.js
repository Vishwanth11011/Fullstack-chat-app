import express from "express";
import {login,logout,updateProfile,checkAuth} from "../controllers/auth.controller.js";
// import { initiateSignup,verifyOtpAndSignup } from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js";
import { initiateSignup, verifyOtpAndSignup } from "../controllers/auth.controller.js";
import { forgotPassword, resetPassword } from "../controllers/auth.controller.js";

const router = express.Router()

// router.post("/signup", signup);

router.post("/initiate-signup", initiateSignup);
router.post("/verify-otp", verifyOtpAndSignup);
          

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectRoute ,updateProfile);

router.get("/check",protectRoute,checkAuth);

router.use((req, res, next) => {
  console.log(`Auth router received: ${req.method} ${req.originalUrl}`);
  next();
});

export default router;