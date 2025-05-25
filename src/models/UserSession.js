import mongoose from "mongoose";

const userSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '7d' // Automatically delete after 7 days
    }
});

const UserSession = mongoose.model("UserSession", userSessionSchema);

export default UserSession;
