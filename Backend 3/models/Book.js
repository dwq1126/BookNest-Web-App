import mongoose from '../db.js';

const bookSchema = new mongoose.Schema({
  title:         { type: String, required: true, trim: true },
  author:        { type: String, required: true, trim: true }, 
  description:   { type: String },
  category:      { type: String },
  publishedDate: { type: Date },
  isbn:          { type: String },
  coverImage:    { type: String },
  averageRating: { type: Number, default: 0, min: 0, max: 5 }
}, { timestamps: true });

export default mongoose.model('Book', bookSchema);
