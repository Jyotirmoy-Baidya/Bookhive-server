import { STATUS_CODES } from "../constants/contants.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";



export const FetchProfileData = async (req, res) => {
    try {

        const user = req.user;
        const ProfileData = await User.findById(user.userId); // exclude password

        if (!ProfileData) {
            return res.status(STATUS_CODES.NOT_FOUND).json(new ApiError(STATUS_CODES.NOT_FOUND, 'User not found'));
        }

        res.status(STATUS_CODES.OK)
            .json({
                success: true,
                statusCode: STATUS_CODES.OK,
                data: ProfileData
            });
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
    }
}

export const UpdateProfileUsername = async (req, res) => {
    try {
        const user = req.user;
        const { user_name } = req.body;

        if (!user_name) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(new ApiError(STATUS_CODES, "Username required"));
        }

        const updatedUserName = await User.findByIdAndUpdate(
            user.userId,
            { user_name },
            { new: true }
        )

        if (!updatedUserName) {
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json(new ApiError(STATUS_CODES.NOT_FOUND, "User Not Found"));
        }

        res
            .status(STATUS_CODES.OK)
            .json(new ApiResponse(STATUS_CODES.OK, "Username Updated", updatedUserName.user_name));

    } catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Internal Server Error"));
    }
}

//Build Connections to other people for chat
export const AddConnections = async (req, res) => {
    try {
        const user = req.user;
        const userToConnect = req.params.id;

    } catch (error) {

    }
}
