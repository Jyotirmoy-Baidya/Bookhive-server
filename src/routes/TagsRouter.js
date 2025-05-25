import express from 'express'
const router = express.Router()
import authMiddleware from '../middlewares/authMiddleware.js';
import { createTag, getAllTags } from '../controllers/TagsController.js'

router.get('/all-tags', authMiddleware, getAllTags);
router.post('/create-tag', authMiddleware, createTag);

export default router;