import { STATUS_CODES } from "../constants/contants.js"
import Tag from "../models/Tag.js";
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js";

export const getAllTags = async (req, res) => {
    try {
        const tags = await Tag.find().select('name -_id');
        res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, "All Tags Fetched", tags))
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Internal Server Error"));
    }
}

export const createTag = async (req, res) => {
    try {
        const { tag } = req.body;
        const userId = req.user.userId;

        // Check if tag already exists for this user
        const existingTag = await Tag.findOne({ name: tag, createdBy: userId });
        if (existingTag) {
            return res.status(STATUS_CODES.CONFLICT).json(
                new ApiResponse(STATUS_CODES.CONFLICT, "Tag already exists", existingTag)
            );
        }

        const createdTag = new Tag({
            name: tag,
            createdBy: userId
        });

        await createdTag.save();

        res.status(STATUS_CODES.CREATED).json(
            new ApiResponse(STATUS_CODES.CREATED, "New tag created", createdTag)
        );
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
            new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message)
        );
    }
};
