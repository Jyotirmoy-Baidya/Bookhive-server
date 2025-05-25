import express from 'express'
import authMiddleware from '../middlewares/authMiddleware';
import { createBook, deleteBookById, getAllBooks, updateBookById } from '../controllers/BookController';
import { addBidToBook, deleteBidFromBook, updateBidOnBook } from '../controllers/BookBidController';

const router = express.Router()

//GET /books?page=1&limit=10&tags=Fiction,Science
router.get("/books", authMiddleware, getAllBooks);
router.post('/create-book', authMiddleware, createBook);
router.patch('/update-book-details/:id', authMiddleware, updateBookById);
router.delete('/delete-book/:id', authMiddleware, deleteBookById);
router.patch('/add-bid/:id', authMiddleware, addBidToBook);
router.patch('/update-bid/:id/:bidId', authMiddleware, updateBidOnBook);
router.delete('/delete-bid/:id/:bidId', authMiddleware, deleteBidFromBook);

export default router;