import jwt from "jsonwebtoken";
import { STATUS_CODES } from "../constants/contants.js";
import UserSession from "../models/UserSession.js";
import ApiError from "../utils/ApiError.js";

const authMiddleware = async (req, res, next) => {
    try {
        // Retrieve token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({
                succes: false,
                statusCode: STATUS_CODES.UNAUTHORIZED,
                message: "Unauthorized user"
            });
        }

        // Verify token
        const tokenData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // Checking and getting user
        const userSession = await UserSession.findOne({ userId: tokenData.userId, token });
        if (!userSession) {
            return res
                .status(STATUS_CODES.UNAUTHORIZED)
                .json(new ApiError(STATUS_CODES.UNAUTHORIZED, "Unauthorized: Session invalid"));
        }

        // Adding user to request object
        req.user = userSession;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({
                success: false,
                statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
                message: "Internal Server Error"
            });
    }
};

export default authMiddleware;
