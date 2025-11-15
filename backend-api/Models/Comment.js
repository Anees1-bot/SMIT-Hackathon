const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'posts', required: true },
  content: { type: String, required: true, trim: true },
  author: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  votes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('comments', CommentSchema);

