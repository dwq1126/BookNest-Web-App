import { ObjectId } from 'mongodb';

export const verifyBookId = (id) => {
  if (!id || !ObjectId.isValid(id)) throw new Error('Invalid book_id.');
  return new ObjectId(id);
};

export const verifyUserId = (id) => {
  if (!id || !ObjectId.isValid(id)) throw new Error('Invalid userId.');
  return new ObjectId(id);
};

export const verifyReviewText = (txt) => {
  if (typeof txt !== 'string') throw new Error('reviewText must be string.');
  txt = txt.trim();
  if (!txt) throw new Error('reviewText cannot be empty.');
  if (txt.length > 2000) throw new Error('reviewText too long.');
  return txt;
};

export const verifyRating = (r) => {
  const n = Number(r);
  if (!Number.isInteger(n) || n < 1 || n > 5) throw new Error('rating must be 1-5.');
  return n;
};

export const reviewhelper = {
  verifyBookId,
  verifyUserId,
  verifyReviewText,
  verifyRating
};