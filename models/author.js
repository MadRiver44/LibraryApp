//author schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AuthorSchema = Schema({
  firstName: {type: String, required: true, max: 100},
  lastName: {type: String, required: true, max: 100},
  dateOfBirth: {type: Date},
  dateOfDeath: {type: Date}
});

// Virtual for author's full name

AuthorSchema.virtual('name')
  .get(function() {
    return '/catalog/author/' + ' , ' + this.firstName;
  });

// Virtual for author's URL

AuthorSchema.virtual('url')
  .get(function() {
    return '/catalog/author/' + this._id;
  });

// export model
module.exports = mongoose.model('Author', AuthorSchema);
