import { STATUS_CODES } from "../constants/contants.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const addBidToBook = async (req, res) => {
    try {
        const { id } = req.params; // book ID
        const { price } = req.body;
        const userId = req.user.userId;

        if (!price || price <= 0) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(
                new ApiError(STATUS_CODES.BAD_REQUEST, "Bid price must be a positive number")
            );
        }

        const book = await Book.findById(id);
        if (!book) {
            return res.status(STATUS_CODES.NOT_FOUND).json(
                new ApiError(STATUS_CODES.NOT_FOUND, "Book not found")
            );
        }

        book.bids.push({ user: userId, price });
        await book.save();

        return res.status(STATUS_CODES.CREATED).json(
            new ApiResponse(STATUS_CODES.CREATED, "Bid added successfully", book.bids)
        );
    } catch (error) {
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
            new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message)
        );
    }
};

export const updateBidOnBook = async (req, res) => {
    try {
        const { id, bidId } = req.params; // bookId and bidId
        const { price } = req.body;
        const userId = req.user.userId;

        const book = await Book.findById(id);
        if (!book) {
            return res.status(STATUS_CODES.NOT_FOUND).json(
                new ApiError(STATUS_CODES.NOT_FOUND, "Book not found")
            );
        }

        const bid = book.bids.id(bidId);
        if (!bid) {
            return res.status(STATUS_CODES.NOT_FOUND).json(
                new ApiError(STATUS_CODES.NOT_FOUND, "Bid not found")
            );
        }

        if (bid.user.toString() !== userId.toString()) {
            return res.status(STATUS_CODES.FORBIDDEN).json(
                new ApiError(STATUS_CODES.FORBIDDEN, "You are not authorized to update this bid")
            );
        }

        bid.price = price;
        bid.bidAt = Date.now();
        await book.save();

        return res.status(STATUS_CODES.OK).json(
            new ApiResponse(STATUS_CODES.OK, "Bid updated successfully", bid)
        );
    } catch (error) {
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
            new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message)
        );
    }
};

export const deleteBidFromBook = async (req, res) => {
    try {
        const { id, bidId } = req.params; // bookId and bidId
        const userId = req.user.userId;

        const book = await Book.findById(id);
        if (!book) {
            return res.status(STATUS_CODES.NOT_FOUND).json(
                new ApiError(STATUS_CODES.NOT_FOUND, "Book not found")
            );
        }

        const bid = book.bids.id(bidId);
        if (!bid) {
            return res.status(STATUS_CODES.NOT_FOUND).json(
                new ApiError(STATUS_CODES.NOT_FOUND, "Bid not found")
            );
        }

        const isBidOwner = bid.user.toString() === userId.toString();
        const isBookOwner = book.owner.toString() === userId.toString();

        if (!isBidOwner && !isBookOwner) {
            return res.status(STATUS_CODES.FORBIDDEN).json(
                new ApiError(STATUS_CODES.FORBIDDEN, "You are not authorized to delete this bid")
            );
        }

        bid.deleteOne();
        await book.save();

        return res.status(STATUS_CODES.OK).json(
            new ApiResponse(STATUS_CODES.OK, "Bid deleted successfully")
        );
    } catch (error) {
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
            new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message)
        );
    }
};