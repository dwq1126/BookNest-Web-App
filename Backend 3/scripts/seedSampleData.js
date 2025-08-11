import { connectDB } from '../db.js';
import mongoose from 'mongoose';
import Book from '../models/Book.js';
import Review from '../models/Review.js';

async function run() {
  try {
    await connectDB();
 
    await Book.deleteMany({});
    await Review.deleteMany({});

    const books = await Book.insertMany([
      { title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help' },
      { title: 'Deep Work', author: 'Cal Newport', category: 'Productivity' },
      { title: 'The Psychology of Money', author: 'Morgan Housel', category: 'Finance' },
      { title: 'Clean Code', author: 'Robert C. Martin', category: 'Programming' },
      { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Psychology' }
    ]);
 
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const reviews = [];

    for (const b of books) {
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        reviews.push({
          bookId: b._id,
          userName: `user${i + 1}`,
          rating: 3 + Math.floor(Math.random() * 3),
          comment: 'Great book!',
          createdAt: new Date(firstDay.getTime() + Math.random() * (now - firstDay)),
          updatedAt: new Date()
        });
      }
    }

    await Review.insertMany(reviews);
    console.log('✅ Seed done.');
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
