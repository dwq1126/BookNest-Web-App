import express from 'express';
import { dbConnection } from '../config/mongoConnection.js';
import { ObjectId } from 'mongodb';
import authors from '../data/Author.js'

const bookRoutes = express.Router();

bookRoutes.get('/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    if (!ObjectId.isValid(bookId)) {
      return res.status(400).send('Invalid book ID');
    }

    const db = await dbConnection();
    const booksCollection = db.collection('books');
    const reviewsCollection = db.collection('reviews');

    const book = await booksCollection.findOne({ 
      _id: new ObjectId(bookId) 
    });
    const author = await authors.findAuthor(book.author);
    const authorId = author.length > 0 ? author[0]._id : null;
    
    if (!book) {
      return res.status(404).send('Book not found');
    }

    const reviews = await reviewsCollection.find({ 
      bookId: new ObjectId(bookId) 
    }).sort({ createdAt: -1 }).toArray();

    res.render('bookDetails', {
      book: {
        ...book,
        authorId: authorId,
        _id: book._id.toString(),
        reviews: reviews.map(r => ({
          ...r,
          _id: r._id.toString(),
          createdAt: r.createdAt.toISOString()
        }))
      },
      user: req.session.user || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

bookRoutes.post('/:id/reviews', async (req, res) => {
  try {
    const bookId = req.params.id;
    const { userId, userName, rating, comment } = req.body;
    
    if (!ObjectId.isValid(bookId)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }
    if (!userId || !userName || !rating || !comment) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = await dbConnection();
    const reviewsCollection = db.collection('reviews');
    const booksCollection = db.collection('books');

    const newReview = {
      bookId: new ObjectId(bookId),
      userId: new ObjectId(userId),
      userName,
      rating: parseInt(rating),
      comment,
      createdAt: new Date()
    };

    const insertResult = await reviewsCollection.insertOne(newReview);
    const insertedReview = { ...newReview, _id: insertResult.insertedId };

    const bookReviews = await reviewsCollection.find({ 
      bookId: new ObjectId(bookId) 
    }).toArray();
    
    const totalRating = bookReviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = bookReviews.length > 0 
      ? (totalRating / bookReviews.length).toFixed(1) 
      : 0;

    await booksCollection.updateOne(
      { _id: new ObjectId(bookId) },
      { $set: { rating: parseFloat(avgRating) } }
    );

    res.json({ 
      success: true, 
      review: {
        ...insertedReview,
        _id: insertedReview._id.toString()
      }
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

bookRoutes.delete('/:bookId/reviews/:reviewId', async (req, res) => {
  try {
    const { bookId, reviewId } = req.params;
    
    if (!ObjectId.isValid(bookId) || !ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const db = await dbConnection();
    const reviewsCollection = db.collection('reviews');
    const booksCollection = db.collection('books');

    const deleteResult = await reviewsCollection.deleteOne({ 
      _id: new ObjectId(reviewId) 
    });
    
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const bookReviews = await reviewsCollection.find({ 
      bookId: new ObjectId(bookId) 
    }).toArray();
    
    const totalRating = bookReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = bookReviews.length > 0 
      ? (totalRating / bookReviews.length).toFixed(1) 
      : 0;

    await booksCollection.updateOne(
      { _id: new ObjectId(bookId) },
      { $set: { rating: parseFloat(avgRating) } }
    );

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default bookRoutes;
