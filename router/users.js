import express from 'express';
import { ObjectId } from 'mongodb';
import { dbConnection } from '../config/mongoConnection.js';

const UserRouter = express.Router();

UserRouter.get('/profile', async (req, res) => {
  if (!req.session?.user) return res.redirect('/auth/login');

  try {
    const db = await dbConnection();
    const reviewsCol = db.collection('reviews');
    const user = await db.collection('users').findOne(
      { userId: req.session.user.userId },
      { projection: { hashedPassword: 0 } }
    );

    if (!user) return res.redirect('/auth/login');

    const pipeline = [
      { $match: { userId: new ObjectId(user._id) } },
      {
        $lookup: {
          from: 'books',
          localField: 'bookId',
          foreignField: '_id',
          as: 'book'
        }
      },
      { $unwind: { path: '$book', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          rating: 1,
          comment: 1,
          createdAt: 1,
          isEdited: 1,
          bookId: 1,
          'book._id': 1,
          'book.title': 1,
          'book.coverUrl': 1,
          'book.author': 1
        }
      }
    ];

    const reviews = await reviewsCol.aggregate(pipeline).toArray();
    const fmt = (d) => {
      const dt = d instanceof Date ? d : (d ? new Date(d) : new Date());
      return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formattedReviews = reviews.map(r => ({
      ...r,
      _id: r._id?.toString?.() ?? '',
      bookId: r.bookId?.toString?.() ?? r.book?._id?.toString?.() ?? '',
      date: fmt(r.createdAt)
    }));
 
    const avatarUrl = user.profilePicture || '/img/profile/default.jpg';  
    const username  = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'User';

    res.render('user-profile', {
      user: {
        ...user,
        _id: user._id.toString(),
        avatar: avatarUrl,
        username,
        joinDate: user.createdAt ? fmt(user.createdAt) : 'Unknown',
        isAdmin: user.role === 'admin'
      },
      reviews: formattedReviews
    });
  } catch (e) {
    console.error('Profile error:', e);
    res.status(500).render('404', { message: 'Unable to load profile' });
  }
});

export default UserRouter;
