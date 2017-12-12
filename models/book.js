var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookSchema = new Schema({
  title: { type: String, required: true },
  // author is a reference to a singl Author model object
  author: { type: Schema.ObjectId, ref: 'Author', required: true },
  summary: { type: String, required: true },
  isbn: { type: String, required: true },
  //genre is a reference to an array of Genre model objects
  genre: [{ type: Schema.ObjectId, ref: 'Genre' }],
});

// Virtual for books URL
BookSchema.virtual('url').get(function() {
  return '/catalog/book/' + this._id;
});

module.exports = mongoose.model('Book', BookSchema);
