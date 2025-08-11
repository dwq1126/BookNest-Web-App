import mongoose from '../db.js';

const AuthorSchema = new mongoose.Schema({
  author_id:   { type: String, index: true, unique: true, sparse: true },
  name:        { type: String, required: true, trim: true },
  birth_date:  { type: String, default: '' }, 
  death_date:  { type: String, default: '' },
  nationality: { type: String, default: '' },
  biography:   { type: String, default: '' },
  works:       { type: [String], default: [] },
  awards:      { type: [String], default: [] },
  created_at:  { type: String, default: '' },
  updated_at:  { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Author', AuthorSchema);
