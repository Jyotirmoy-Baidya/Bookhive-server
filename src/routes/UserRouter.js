
import { FetchProfileData, UpdateProfileUsername } from "../controllers/UserController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import express from 'express';

const router = express.Router();

router.get('/profile', authMiddleware, FetchProfileData);
router.patch('/profile-username-update', authMiddleware, UpdateProfileUsername);

export default router;
