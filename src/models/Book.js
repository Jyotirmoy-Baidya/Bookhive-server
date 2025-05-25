import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
    }],
    basePrice: {
        type: Number,
        required: true,
    },
    bids: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        bidAt: {
            type: Date,
            default: Date.now,
        }
    }],
    condition: {
        type: String,
        enum: ["New", "Like New", "Very Good", "Good", "Acceptable"],
        required: true,
    },
    editionYear: {
        type: Number,
        required: true,
    },
    author: {
        type: String,
        required: true,
        trim: true,
    },
    publication: {
        type: String,
        required: true,
        trim: true,
    },
    images: [{
        type: String, // Assuming storing URLs
    }],
    status: {
        type: String,
        enum: ["Available", "Sold", "Removed"],
        default: "Available",
    },
}, {
    timestamps: true
});

export const Book = mongoose.model("Book", bookSchema);
