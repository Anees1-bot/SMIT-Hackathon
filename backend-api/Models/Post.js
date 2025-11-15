// backend/Models/Post.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  tags: { type: [String], default: [] },
  votes: { type: Number, default: 0 },
  author: { type: Schema.Types.ObjectId, ref: 'users', required: true }
}, { timestamps: true });

module.exports = mongoose.model('posts', PostSchema);