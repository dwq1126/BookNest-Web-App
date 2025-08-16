import express from 'express';
import { dbConnection } from '../config/mongoConnection.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not logged in' 
      });
    }

    const { bookId, rating, comment } = req.body;
    
    if (!bookId || !rating || !comment) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields must be filled' 
      });
    }

    const db = await dbConnection();
    const reviewsCollection = db.collection('reviews');
    const booksCollection = db.collection('books');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { firstName: 1, lastName: 1 } }
    );
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    const userName = `${user.firstName} ${user.lastName}`;

    const newReview = {
      bookId: new ObjectId(bookId),
      userId: new ObjectId(userId),
      userName,
      rating: parseInt(rating),
      comment,
      createdAt: new Date(),
      isEdited: false
    };

    const result = await reviewsCollection.insertOne(newReview);
    const insertedId = result.insertedId;

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { reviewIds: insertedId.toString() } }
    );

    const bookReviews = await reviewsCollection.find({ 
      bookId: new ObjectId(bookId) 
    }).toArray();
    
    const totalRating = bookReviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = bookReviews.length > 0 ? 
      (totalRating / bookReviews.length).toFixed(1) : 0;

    await booksCollection.updateOne(
      { _id: new ObjectId(bookId) },
      { $set: { rating: avgRating } }
    );

    res.json({ 
      success: true, 
      review: {
        ...newReview,
        _id: insertedId.toString()
      }
    });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const reviewId = req.params.id;
    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid review ID' 
      });
    }

    const { rating, comment } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ 
        success: false, 
        error: 'Rating and comment content cannot be empty' 
      });
    }
    
    const db = await dbConnection();
    const reviewsCollection = db.collection('reviews');
    
    const result = await reviewsCollection.updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: { 
        rating: parseInt(rating), 
        comment, 
        isEdited: true,
        updatedAt: new Date()
      }}
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found or not updated' 
      });
    }
    
    const updatedReview = await reviewsCollection.findOne({ 
      _id: new ObjectId(reviewId) 
    });
    
    const bookReviews = await reviewsCollection.find({ 
      bookId: updatedReview.bookId 
    }).toArray();
    
    const totalRating = bookReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = bookReviews.length > 0 
      ? (totalRating / bookReviews.length).toFixed(1) 
      : 0;

    const booksCollection = db.collection('books');
    await booksCollection.updateOne(
      { _id: updatedReview.bookId },
      { $set: { rating: avgRating } }
    );

    res.json({ 
      success: true,
      review: {
        ...updatedReview,
        _id: updatedReview._id.toString()
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const reviewId = req.params.id;
    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid review ID' 
      });
    }

    const db = await dbConnection();
    const reviewsCollection = db.collection('reviews');
    const booksCollection = db.collection('books');

    const review = await reviewsCollection.findOne({ 
      _id: new ObjectId(reviewId) 
    });
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    await reviewsCollection.deleteOne({ 
      _id: new ObjectId(reviewId) 
    });

    const bookReviews = await reviewsCollection.find({ 
      bookId: review.bookId 
    }).toArray();
    
    const totalRating = bookReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = bookReviews.length > 0 
      ? (totalRating / bookReviews.length).toFixed(1) 
      : 0;

    await booksCollection.updateOne(
      { _id: review.bookId },
      { $set: { rating: avgRating } }
    );

    res.json({ 
      success: true, 
      message: 'Review deleted' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

export default router;