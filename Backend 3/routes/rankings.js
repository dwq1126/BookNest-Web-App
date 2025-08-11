import express from 'express';
import Review from '../models/Review.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try { 
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const rankings = await Review.aggregate([
      {
        $match: { createdAt: { $gte: startOfMonth } } 
      },
      {
        $group: {
          _id: '$bookId',
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      },
      { $sort: { avgRating: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'books', 
          localField: '_id',
          foreignField: '_id',
          as: 'bookInfo'
        }
      },
      { $unwind: '$bookInfo' },
      {
        $project: {
          _id: 0,
          title: '$bookInfo.title',
          avgRating: { $round: ['$avgRating', 1] },
          reviewCount: 1
        }
      }
    ]);

    res.json({ ok: true, data: rankings });
  } catch (err) {
    next(err);
  }
});

export default router;
