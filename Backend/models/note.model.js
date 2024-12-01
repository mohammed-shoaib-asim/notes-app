const mongoose = require('mongoose');
const { create } = require('./user.model');  // You don't need this import here
const Schema = mongoose.Schema;

const noteSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  tags: { type: [String], default: [] },
  isPinned: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,  // Change this to ObjectId
    ref: 'User',  // Link this to the User model
    required: true
  },
  createOn: {
    type: Date,
    default: new Date().getTime()
  },
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
