import { acceptInvite, cancelSentRequest, deleteConnectedUser, getConnectedUsers, getPendingRequestsDetails, rejectReceivedRequest, sendInvite } from '../controllers/UserConnectionController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import express from 'express';

const router = express.Router();

router.post('/send-request/:id', authMiddleware, sendInvite);
router.post('/accept-request/:id', authMiddleware, acceptInvite);
router.delete('/delete-connected-user/:id', authMiddleware, deleteConnectedUser);
router.delete('/cancel-sent-request/:id', authMiddleware, cancelSentRequest);
router.delete('/reject-received-request/:id', authMiddleware, rejectReceivedRequest);
router.get('/get-pending-request-details', authMiddleware, getPendingRequestsDetails);
router.get('/get-connected-users', authMiddleware, getConnectedUsers);


export default router;
