//Register -> create new user in the database using email
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // adjust the path if necessary
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { STATUS_CODES } from "../constants/contants.js";
import UserSession from "../models/UserSession.js";
import UserConnections from "../models/UserConnections.js";

//Add a new user to the Database
export const registerUser = async (req, res) => {
    try {
        const { email, user_name } = req.body;

        // Check if user already exists by email or username
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res
                .status(STATUS_CODES.CONFLICT)
                .json(new ApiError(STATUS_CODES.CONFLICT, 'User with this email or username already exists'));
        }

        // Create and save the new user
        const newUser = new User({
            email,
            user_name
        });

        await newUser.save();

        // Create a UserConnections document
        const newUserConnection = new UserConnections({
            userId: newUser._id,
            connectedUser: [],
            pendingReceivedRequests: [],
            pendingSentRequests: []
        });

        await newUserConnection.save();

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: newUser._id,
                email: newUser.email
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        // Create UserSession
        const session = new UserSession({
            userId: newUser._id,
            token: token
        });
        await session.save();

        //Respond
        res
            .status(STATUS_CODES.CREATED)
            .json
            (new ApiResponse(STATUS_CODES.CREATED, 'New User Resgitered', token));

    } catch (error) {
        console.error("Registration error:", error);
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, 'Server error during registration'));
    }
};

//Login User
export const loginUser = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists by email
        const existingUser = await User.findOne({ email });

        //if no user exists
        if (!existingUser) {
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json(new ApiError(STATUS_CODES.NOT_FOUND, "User not found"));
        }

        //Generate jwt token
        const token = jwt.sign(
            {
                userId: existingUser._id,
                email: existingUser.email
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "7d" }
        )

        // Check if session already exists
        let session = await UserSession.findOne({ userId: existingUser._id });

        if (session) {
            // Update existing session
            session.token = token;
            await session.save();
        } else {
            // Create new session
            session = new UserSession({
                userId: existingUser._id,
                token: token
            });
            await session.save();
        }

        return res
            .status(STATUS_CODES.OK)
            .json(new ApiResponse(STATUS_CODES.OK, 'User logged in successfully', token))
    } catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Server error during login"))
    }
}


//Logout
export const logoutUser = async (req, res) => {
    try {
        const userId = req.user.userId; // coming from auth middleware

        if (!userId) {
            return res
                .status(STATUS_CODES.UNAUTHORIZED)
                .json(new ApiError(STATUS_CODES.UNAUTHORIZED, "Unauthorized"));
        }

        // Delete user session
        await UserSession.deleteOne({ userId });

        return res
            .status(STATUS_CODES.OK)
            .json(new ApiResponse(STATUS_CODES.OK, "Logout successful"));

    } catch (error) {
        console.error("Logout error:", error);
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Server error during logout"));
    }
};
