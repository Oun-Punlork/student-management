import express from "express";
import {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  getCurrentUser,
  logout,
  uploadProfileImage,
} from "../controller/AuthController.js";
import { authmiddleware } from "../middleware/AuthMiddleware.js";
import { getMyScores } from "../controller/ScoreController.js";

const router = express.Router();
const profileImageBody = express.raw({
  type: ["image/jpeg", "image/png", "image/webp"],
  limit: "5mb",
});

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/verify-email/resend', resendVerificationEmail);
router.post('/logout', authmiddleware, logout);
router.get('/me', authmiddleware, getCurrentUser);
router.get('/me/scores', authmiddleware, getMyScores);
router.put('/me/profile-image', authmiddleware, profileImageBody, uploadProfileImage);

export default router;
