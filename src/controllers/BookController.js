
import mongoose from 'mongoose';
import { Book } from '../models/Book';
import { STATUS_CODES } from '../constants/contants';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';

export const getAllBooks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const tagNames = req.query.tags?.split(",").map(tag => tag.trim()) || [];

        let tagIds = [];

        if (tagNames.length > 0) {
            const tags = await Tag.find({ name: { $in: tagNames } }).select("_id");
            tagIds = tags.map(tag => tag._id);
        }

        const filter = {
            ...(tagIds.length > 0 && { tags: { $in: tagIds } }),
            status: "Available"
        };

        const total = await Book.countDocuments(filter);
        const books = await Book.find(filter)
            .populate("owner", "name email")
            .populate("tags", "name")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return res.status(STATUS_CODES.OK).json(
            new ApiResponse(STATUS_CODES.OK, "Books fetched successfully", {
                books,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            })
        );
    } catch (error) {
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
            new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message)
        );
    }
};


// Create a new book
export const createBook = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            title,
            description,
            tags = [],
            basePrice,
            condition,
            editionYear,
            author,
            publication,
            images = []
        } = req.body;

        const book = new Book({
            title,
            description,
            owner: userId,
            tags,
            basePrice,
            condition,
            editionYear,
            author,
            publication,
            images
        });

        await book.save();

        return res.status(STATUS_CODES.CREATED).json(
            new ApiResponse(STATUS_CODES.CREATED, "New book created", book)
        );
    } catch (err) {
        return res.status(STATUS_CODES.BAD_REQUEST).json(
            new ApiError(STATUS_CODES.BAD_REQUEST, err.message)
        );
    }
};


export const updateBookById = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent updating the `bids` field
        const { bids, ...updateData } = req.body;

        const updatedBook = await Book.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedBook) {
            return res.status(STATUS_CODES.NOT_FOUND).json(
                new ApiError(STATUS_CODES.NOT_FOUND, "Book not found")
            );
        }

        return res.status(STATUS_CODES.OK).json(
            new ApiResponse(STATUS_CODES.OK, "Book updated successfully", updatedBook)
        );
    } catch (error) {
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
            new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message)
        );
    }
};

export const deleteBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const book = await Book.findById(id);

        if (!book) {
            return res.status(STATUS_CODES.NOT_FOUND).json(
                new ApiError(STATUS_CODES.NOT_FOUND, "Book not found")
            );
        }

        if (book.owner.toString() !== userId.toString()) {
            return res.status(STATUS_CODES.FORBIDDEN).json(
                new ApiError(STATUS_CODES.FORBIDDEN, "You are not authorized to delete this book")
            );
        }

        await book.deleteOne();

        return res.status(STATUS_CODES.OK).json(
            new ApiResponse(STATUS_CODES.OK, "Book deleted successfully")
        );
    } catch (error) {
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
            new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message)
        );
    }
};