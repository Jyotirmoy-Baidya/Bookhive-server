import mongoose from "mongoose";

const userConnectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    connectedUser: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: []
    },
    pendingReceivedRequests: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            message: {
                type: String,
                required: true
            }
        }
    ],
    pendingSentRequests: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            message: {
                type: String,
                required: true
            }
        }
    ]
});

const UserConnections = mongoose.model("UserConnections", userConnectionSchema);

export default UserConnections;
