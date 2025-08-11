import mongoose from '../db.js';

const adminLogSchema = new mongoose.Schema({
  adminName: { type: String, required: true },         
  action:    { type: String, required: true },     
  targetId:  { type: mongoose.Schema.Types.ObjectId }, 
  meta:      { type: Object, default: {} },          
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('AdminLog', adminLogSchema);
