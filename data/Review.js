import { dbConnection } from '../config/mongoConnection.js';
import { reviewhelper } from './Reviewhelper.js';

const createReview = async ({ book_id, userId, reviewText, rating }) => {
  const bid = reviewhelper.verifyBookId(book_id);
  const uid = reviewhelper.verifyUserId(userId);
  const txt = reviewhelper.verifyReviewText(reviewText);
  const rat = reviewhelper.verifyRating(rating);

  const db = await dbConnection();
  const books = db.collection('books');
  const users = db.collection('users');
  const reviews = db.collection('reviews');

  if (!(await books.findOne({ _id: bid }))) throw new Error('Book not found');
  if (!(await users.findOne({ _id: uid }))) throw new Error('User not found');

  const { insertedId } = await reviews.insertOne({ book_id: bid, userId: uid, reviewText: txt, rating: rat });
  return { reviewId: insertedId.toString(), book_id: bid, userId: uid, reviewText: txt, rating: rat };
};

const getAllReviews = async (book_id) => {
  const bid = reviewhelper.verifyBookId(book_id);
  const db = await dbConnection();
  const reviews = db.collection('reviews');
  return (await reviews.find({ book_id: bid }).toArray()).map(r => ({ ...r, reviewId: r._id.toString() }));
};

const getReview = async (reviewId) => {
  const rid = reviewhelper.verifyBookId(reviewId);
  const db = await dbConnection();
  const reviews = db.collection('reviews');
  const r = await reviews.findOne({ _id: rid });
  if (!r) throw new Error('Review not found');
  return { ...r, reviewId: r._id.toString() };
};

const removeReview = async (reviewId) => {
  const rid = reviewhelper.verifyBookId(reviewId);
  const db = await dbConnection();
  const reviews = db.collection('reviews');
  const { deletedCount } = await reviews.deleteOne({ _id: rid });
  if (!deletedCount) throw new Error('Review not found');
  return { deleted: true, reviewId };
};

export default { createReview, getAllReviews, getReview, removeReview };