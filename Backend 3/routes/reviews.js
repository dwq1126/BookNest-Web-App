import express from 'express';
import Review from '../models/Review.js';
import Book from '../models/Book.js';
import { assertType, requireFields } from '../middleware/validate.js';

const router = express.Router();
 
router.post('/reviews', 
  requireFields(['bookId','userName','rating']),
  async (req, res) => {
    try {
      const { bookId, userName, rating, comment='' } = req.body;
      assertType(req.body, { userName:'string' });

      const num = Number(rating);
      if (!Number.isFinite(num) || num < 1 || num > 5) {
        return res.status(400).json({ ok:false, error:'rating must be 1~5' });
      }
 
      const book = await Book.findById(bookId);
      if (!book) return res.status(404).json({ ok:false, error:'Book not found' });

      const review = await Review.create({ bookId, userName, rating:num, comment });

      res.json({ ok:true, data:review });
    } catch (e) {
      res.status(400).json({ ok:false, error:e.message });
    }
  }
);

export default router;
