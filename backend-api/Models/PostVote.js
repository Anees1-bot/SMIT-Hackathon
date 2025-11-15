const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostVoteSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
	postId: { type: Schema.Types.ObjectId, ref: 'posts', required: true, index: true },
	type: { type: String, enum: ['upvote', 'downvote'], required: true }
}, { timestamps: true });

// Ensure a user can only vote once per post
PostVoteSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model('post_votes', PostVoteSchema);


