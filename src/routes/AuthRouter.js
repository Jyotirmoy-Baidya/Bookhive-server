import { STATUS_CODES } from "../constants/contants.js";
import { loginUser, logoutUser, registerUser } from "../controllers/AuthControllers.js";
import express from 'express';
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.delete('/logout', authMiddleware, logoutUser);



export default router;