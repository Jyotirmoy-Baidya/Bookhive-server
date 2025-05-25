import UserConnections from "../models/UserConnections.js";
import { STATUS_CODES } from "../constants/contants.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

// Send an invite
export const sendInvite = async (req, res) => {
    const user = req.user;
    const senderId = user.userId;
    const receiverId = req.params.id;
    const { message } = req.body;

    try {
        if (senderId === receiverId) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(new ApiError(STATUS_CODES.BAD_REQUEST, "Cannot invite yourself."));
        }

        const sender = await UserConnections.findOne({ userId: senderId });
        const receiver = await UserConnections.findOne({ userId: receiverId });

        if (!sender || !receiver) {
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json(new ApiError(STATUS_CODES.NOT_FOUND, "Sender or Receiver not found."));
        }

        // Check if already connected
        if (sender.connectedUser.includes(receiverId)) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(new ApiError(STATUS_CODES.BAD_REQUEST, "Already connected."));
        }

        // Check if already invited
        if (sender.pendingSentRequests.some(req => req.user.toString() === receiverId)) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(new ApiError(STATUS_CODES.BAD_REQUEST, "Already sent an invite."));
        }

        // Add pending request
        sender.pendingSentRequests.push({ user: receiverId, message });
        receiver.pendingReceivedRequests.push({ user: senderId, message });

        await sender.save();
        await receiver.save();

        return res
            .status(STATUS_CODES.OK)
            .json(new ApiResponse(STATUS_CODES.OK, "Invite sent successfully.", { receiverId, message }));
    } catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message));
    }
};

// Accept an invite
export const acceptInvite = async (req, res) => {
    const receiverId = req.user.userId;
    const senderId = req.params.id;

    try {
        const receiver = await UserConnections.findOne({ userId: receiverId });
        const sender = await UserConnections.findOne({ userId: senderId });

        if (!receiver || !sender) {
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json(new ApiError(STATUS_CODES.NOT_FOUND, "Sender or Receiver not found."));
        }

        // Check if invite exists
        const pendingRequest = receiver.pendingReceivedRequests.find(req => req.user.toString() === senderId);
        if (!pendingRequest) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(new ApiError(STATUS_CODES.BAD_REQUEST, "No pending invite from this user."));
        }

        // Add each other as connected users
        receiver.connectedUser.push(senderId);
        sender.connectedUser.push(receiverId);

        // Remove pending requests
        receiver.pendingReceivedRequests = receiver.pendingReceivedRequests.filter(req => req.user.toString() !== senderId);
        sender.pendingSentRequests = sender.pendingSentRequests.filter(req => req.user.toString() !== receiverId);

        await receiver.save();
        await sender.save();

        return res
            .status(STATUS_CODES.OK)
            .json(new ApiResponse(STATUS_CODES.OK, "Invite accepted and users connected.", 'Request Accpeted'));
    } catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message));
    }
};



// Delete a connected user
export const deleteConnectedUser = async (req, res) => {
    const userId = req.user.userId;
    const connectedUserId = req.params.id;

    try {
        const user = await UserConnections.findOne({ userId });
        const connectedUser = await UserConnections.findOne({ userId: connectedUserId });

        if (!user || !connectedUser) {
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json(new ApiError(STATUS_CODES.NOT_FOUND, "User or Connected user not found."));
        }

        // Remove each other from connectedUser array
        user.connectedUser = user.connectedUser.filter(id => id.toString() !== connectedUserId);
        connectedUser.connectedUser = connectedUser.connectedUser.filter(id => id.toString() !== userId);

        await user.save();
        await connectedUser.save();

        return res
            .status(STATUS_CODES.OK)
            .json(new ApiResponse(STATUS_CODES.OK, "Connected user deleted successfully."));
    } catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message));
    }
};

// Cancel a sent request
export const cancelSentRequest = async (req, res) => {
    const senderId = req.user.userId;
    const receiverId = req.params.id;

    try {
        const sender = await UserConnections.findOne({ userId: senderId });
        const receiver = await UserConnections.findOne({ userId: receiverId });

        if (!sender || !receiver) {
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json(new ApiError(STATUS_CODES.NOT_FOUND, "Sender or Receiver not found."));
        }

        sender.pendingSentRequests = sender.pendingSentRequests.filter(req => req.user.toString() !== receiverId);
        receiver.pendingReceivedRequests = receiver.pendingReceivedRequests.filter(req => req.user.toString() !== senderId.toString());
        await sender.save();
        await receiver.save();

        return res
            .status(STATUS_CODES.OK)
            .json(new ApiResponse(STATUS_CODES.OK, "Sent request cancelled successfully."));
    } catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message));
    }
};

// Reject a received request
export const rejectReceivedRequest = async (req, res) => {
    const receiverId = req.user.userId;
    const senderId = req.params.id;

    try {
        const receiver = await UserConnections.findOne({ userId: receiverId });
        const sender = await UserConnections.findOne({ userId: senderId });

        if (!receiver || !sender) {
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json(new ApiError(STATUS_CODES.NOT_FOUND, "Sender or Receiver not found."));
        }

        receiver.pendingReceivedRequests = receiver.pendingReceivedRequests.filter(req => req.user.toString() !== senderId);
        sender.pendingSentRequests = sender.pendingSentRequests.filter(req => req.user.toString() !== receiverId.toString());
        console.log(sender.pendingSentRequests, receiverId, senderId);
        await receiver.save();
        await sender.save();

        return res
            .status(STATUS_CODES.OK)
            .json(new ApiResponse(STATUS_CODES.OK, "Received request rejected successfully."));
    } catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message));
    }
};

// Get pending sent requests populated with username and email
export const getPendingSentRequests = async (req, res) => {
    const userId = req.user.userId;

    try {
        const user = await UserConnections.findOne({ userId }).populate({
            path: "pendingSentRequests.user",
            select: "user_name email"
        });

        if (!user) {
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json(new ApiError(STATUS_CODES.NOT_FOUND, "User not found."));
        }

        return res
            .status(STATUS_CODES.OK)
            .json(new ApiResponse(STATUS_CODES.OK, "Pending sent requests fetched.", user.pendingSentRequests));
    } catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message));
    }
};

// Get pending received requests populated with username, email, and message
export const getPendingRequestsDetails = async (req, res) => {
    const userId = req.user.userId;

    try {
        const user = await UserConnections.findOne({ userId }).populate({
            path: "pendingReceivedRequests.user pendingSentRequests.user",
            select: "user_name email"
        });

        if (!user) {
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json(new ApiError(STATUS_CODES.NOT_FOUND, "User not found."));
        }

        return res
            .status(STATUS_CODES.OK)
            .json(new ApiResponse(STATUS_CODES.OK, "Pending received requests fetched.", { receivedRequest: user.pendingReceivedRequests, sentRequest: user.pendingSentRequests }));
    } catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message));
    }
};

// Get connected users populated with username and email
export const getConnectedUsers = async (req, res) => {
    const userId = req.user.userId;

    try {
        const user = await UserConnections.findOne({ userId }).populate({
            path: "connectedUser",
            select: "user_name email"
        });

        if (!user) {
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json(new ApiError(STATUS_CODES.NOT_FOUND, "User not found."));
        }

        return res
            .status(STATUS_CODES.OK)
            .json(new ApiResponse(STATUS_CODES.OK, "Connected users fetched.", user.connectedUser));
    } catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message));
    }
};

