// models/Tag.js
import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // assuming you have a User model
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Tag = mongoose.model("Tag", tagSchema);
export default Tag;
