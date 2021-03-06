var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var BookInstanceSchema = new Schema({
  // reference to associated book
  book: { type: Schema.ObjectId, ref: 'Book', required: true },
  imprint: { type: String, required: true },
  /* enum: alllows us to set the allowed values of a string. Here we use it to
  specify the status of our books, using an enum means that we can prevent
  mis-spellings and arbitrary status of our books
   dfault: to set the default status of a nwly created book instance to
   "maintenance" and the Date to Date.now
  */
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
    default: 'Maintenance',
  },
  due_back: { type: Date, default: Date.now },
});

// Virtual for bookintance's URL
BookInstanceSchema.virtual('url').get(function() {
  return '/catalog/bookinstance/' + this._id;
});

BookInstanceSchema.virtual('due_back_formatted').get(function() {
  return moment(this.due_back).format('MMMM Do, YYYY');
});

BookInstanceSchema.virtual('due_back_yyyy_mm_dd').get(function() {
  return moment(this.due_back).format('YYYY-MM-DD');
});

//Export model
module.exports = mongoose.model('BookInstance', BookInstanceSchema);
